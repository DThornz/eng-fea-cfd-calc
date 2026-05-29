/* ================================================================
   refs.js — Verified reference database for all calculator cards.
   Every citation has been confirmed against publisher databases.

   Structure:
     _R   — shared reference strings (to avoid duplication)
     CALC_REFS — maps calc function name OR section id → string[]
                 Function name is checked first; section id is the fallback.

   initCardReferences() — called from ui.js on window load.
   Adds a (?) button to each card header that toggles a compact
   reference panel between the header and the card body.
================================================================ */

/* ── Shared verified reference strings ───────────────────────── */
const _R = {

  /* ── Fluid mechanics ───────────────────────────────────── */
  schlichting:   'Schlichting, H. & Gersten, K. (2000). Boundary-Layer Theory (8th ed.). Springer-Verlag.',
  menter_sst:    'Menter, F.R. (1994). Two-equation eddy-viscosity turbulence models for engineering applications. AIAA Journal, 32(8), 1598–1605.',
  wilcox:        'Wilcox, D.C. (2006). Turbulence Modeling for CFD (3rd ed.). DCW Industries.',
  white_fm:      'White, F.M. (2011). Fluid Mechanics (7th ed.). McGraw-Hill Education.',
  batchelor:     'Batchelor, G.K. (1967). An Introduction to Fluid Dynamics. Cambridge University Press.',
  reynolds_1883: 'Reynolds, O. (1883). An experimental investigation of the circumstances which determine whether the motion of water shall be direct or sinuous. Philosophical Transactions of the Royal Society of London, 174, 935–982.',
  dean_1928:     'Dean, W.R. (1928). The streamline motion of fluid in a curved pipe. Philosophical Magazine, 5(30), 673–695.',
  bird_transport:'Bird, R.B., Stewart, W.E. & Lightfoot, E.N. (2002). Transport Phenomena (2nd ed.). Wiley.',
  moody_1944:    'Moody, L.F. (1944). Friction factors for pipe flow. Transactions of the ASME, 66, 671–684.',
  colebrook_1939:'Colebrook, C.F. (1939). Turbulent flow in pipes, with particular reference to the transition region between smooth and rough pipe laws. Journal of the Institution of Civil Engineers, 11(4), 133–156.',
  womersley_1955:'Womersley, J.R. (1955). Method for the calculation of velocity, rate of flow and viscous drag in arteries when the pressure gradient is known. Journal of Physiology, 127(3), 553–563.',
  nichols_blood: 'Nichols, W.W., O\'Rourke, M.F. & Vlachopoulos, C. (2011). McDonald\'s Blood Flow in Arteries (6th ed.). Hodder Arnold.',
  cho_kensey:    'Cho, Y.I. & Kensey, K.R. (1991). Effects of the non-Newtonian viscosity of blood on flows in a diseased arterial vessel. Biorheology, 28(3–4), 241–262.',
  carreau_1972:  'Carreau, P.J. (1972). Rheological equations from molecular network theories. Transactions of the Society of Rheology, 16(1), 99–127.',
  ergun_1952:    'Ergun, S. (1952). Fluid flow through packed columns. Chemical Engineering Progress, 48(2), 89–94.',
  darcy_1856:    'Darcy, H. (1856). Les Fontaines Publiques de la Ville de Dijon. Dalmont, Paris.',
  kozeny_carman: 'Kozeny, J. (1927). Über kapillare Leitung des Wassers im Boden. Sitzungsberichte der Akademie der Wissenschaften in Wien, 136, 271–306. / Carman, P.C. (1937). Fluid flow through granular beds. Transactions of the Institution of Chemical Engineers, 15, 150–166.',
  forchheimer:   'Forchheimer, P. (1901). Wasserbewegung durch Boden. Zeitschrift des Vereines Deutscher Ingenieure, 45, 1781–1788.',
  hagen_1839:    'Hagen, G.H.L. (1839). Über die Bewegung des Wassers in engen zylindrischen Röhren. Poggendorffs Annalen der Physik und Chemie, 46, 423–442.',
  poiseuille_1840:'Poiseuille, J.L.M. (1840). Recherches expérimentales sur le mouvement des liquides dans les tubes de très-petits diamètres. Comptes Rendus de l\'Académie des Sciences, 11, 961–967.',
  ku_osi_1985:   'Ku, D.N., Giddens, D.P., Zarins, C.K. & Glagov, S. (1985). Pulsatile flow and atherosclerosis in the human carotid bifurcation. Arteriosclerosis, 5(3), 293–302.',
  manning_1891:  'Manning, R. (1891). On the flow of water in open channels and pipes. Transactions of the Institution of Civil Engineers of Ireland, 20, 161–207.',
  blasius_1908:  'Blasius, H. (1908). Grenzschichten in Flüssigkeiten mit kleiner Reibung. Zeitschrift für Mathematik und Physik, 56, 1–37.',

  /* ── Solid mechanics / structural ──────────────────────── */
  timoshenko_elast:   'Timoshenko, S.P. & Goodier, J.N. (1951). Theory of Elasticity (2nd ed.). McGraw-Hill.',
  timoshenko_stab:    'Timoshenko, S.P. & Gere, J.M. (1961). Theory of Elastic Stability (2nd ed.). McGraw-Hill.',
  roark:              'Young, W.C., Budynas, R.G. & Sadegh, A.M. (2011). Roark\'s Formulas for Stress and Strain (8th ed.). McGraw-Hill.',
  von_mises_1913:     'von Mises, R. (1913). Mechanik der festen Körper im plastisch-deformablen Zustand. Nachrichten von der Gesellschaft der Wissenschaften zu Göttingen, Mathematisch-Physikalische Klasse, 1913, 582–592.',
  irwin_1957:         'Irwin, G.R. (1957). Analysis of stresses and strains near the end of a crack traversing a plate. Journal of Applied Mechanics, 24, 361–364.',
  anderson_fracture:  'Anderson, T.L. (2017). Fracture Mechanics: Fundamentals and Applications (4th ed.). CRC Press.',
  basquin_1910:       'Basquin, O.H. (1910). The exponential law of endurance tests. Proceedings of the American Society for Testing Materials, 10, 625–630.',
  goodman_1899:       'Goodman, J. (1899). Mechanics Applied to Engineering. Longmans, Green and Co.',
  suresh_fatigue:     'Suresh, S. (1998). Fatigue of Materials (2nd ed.). Cambridge University Press.',
  shigley:            'Budynas, R.G. & Nisbett, J.K. (2020). Shigley\'s Mechanical Engineering Design (11th ed.). McGraw-Hill.',
  hertz_1882:         'Hertz, H. (1882). Über die Berührung fester elastischer Körper. Journal für die reine und angewandte Mathematik, 92, 156–171.',
  johnson_contact:    'Johnson, K.L. (1985). Contact Mechanics. Cambridge University Press.',

  /* ── Materials engineering ──────────────────────────────── */
  tsai_wu_1971:  'Tsai, S.W. & Wu, E.M. (1971). A general theory of strength for anisotropic materials. Journal of Composite Materials, 5(1), 58–80.',
  larson_miller: 'Larson, F.R. & Miller, J. (1952). A time-temperature relationship for rupture and creep stresses. Transactions of the ASME, 74, 765–771.',
  norton_creep:  'Norton, F.H. (1929). Creep of Steel at High Temperatures. McGraw-Hill.',
  voigt_reuss:   'Voigt, W. (1889). Über die Beziehung zwischen den beiden Elasticitätsconstanten isotroper Körper. Annalen der Physik, 274(12), 573–587. / Reuss, A. (1929). Berechnung der Fließgrenze von Mischkristallen. Zeitschrift für angewandte Mathematik und Mechanik, 9(1), 49–58.',
  timoshenko_bimetal: 'Timoshenko, S.P. (1925). Analysis of bi-metal thermostats. Journal of the Optical Society of America, 11(3), 233–255.',

  /* ── Thermodynamics / heat transfer ─────────────────────── */
  incropera:     'Incropera, F.P., Dewitt, D.P., Bergman, T.L. & Lavine, A.S. (2011). Fundamentals of Heat and Mass Transfer (7th ed.). Wiley.',
  fourier_1822:  'Fourier, J.B.J. (1822). Théorie Analytique de la Chaleur. Firmin Didot, Paris.',
  dittus_1930:   'Dittus, F.W. & Boelter, L.M.K. (1930). Heat transfer in automobile radiators of the tubular type. Publications in Engineering, University of California, Berkeley, 2(13), 443–461.',
  ashrae_2021:   'ASHRAE (2021). 2021 ASHRAE Handbook—Fundamentals. American Society of Heating, Refrigerating and Air-Conditioning Engineers.',
  cengel_thermo: 'Çengel, Y.A. & Boles, M.A. (2019). Thermodynamics: An Engineering Approach (9th ed.). McGraw-Hill.',

  /* ── Compressible flow ──────────────────────────────────── */
  shapiro:       'Shapiro, A.H. (1953). The Dynamics and Thermodynamics of Compressible Fluid Flow, Vol. 1. Ronald Press.',
  anderson_comp: 'Anderson, J.D. (2003). Modern Compressible Flow (3rd ed.). McGraw-Hill.',
  courant_1928:  'Courant, R., Friedrichs, K. & Lewy, H. (1928). Über die partiellen Differenzengleichungen der mathematischen Physik. Mathematische Annalen, 100, 32–74.',

  /* ── Mass transfer / chemical engineering ────────────────── */
  fick_1855:     'Fick, A. (1855). Über Diffusion. Annalen der Physik, 170(1), 59–86.',
  levenspiel:    'Levenspiel, O. (1999). Chemical Reaction Engineering (3rd ed.). Wiley.',
  smith_cet:     'Smith, J.M., Van Ness, H.C. & Abbott, M.M. (2005). Introduction to Chemical Engineering Thermodynamics (7th ed.). McGraw-Hill.',
  antoine_1888:  'Antoine, C. (1888). Tensions des vapeurs; nouvelle relation entre les tensions et les températures. Comptes Rendus de l\'Académie des Sciences, 107, 681–684.',
  vdw_1873:      'van der Waals, J.D. (1873). Over de Continuïteit van den Gas- en Vloeistoftoestand. Doctoral dissertation, Universiteit Leiden.',

  /* ── Electrical engineering ─────────────────────────────── */
  ohm_1827:      'Ohm, G.S. (1827). Die galvanische Kette, mathematisch bearbeitet. T.H. Riemann, Berlin.',
  nilsson:       'Nilsson, J.W. & Riedel, S.A. (2014). Electric Circuits (10th ed.). Pearson.',
  horowitz:      'Horowitz, P. & Hill, W. (2015). The Art of Electronics (3rd ed.). Cambridge University Press.',

  /* ── Biomedical engineering ─────────────────────────────── */
  guyton_hall:   'Guyton, A.C. & Hall, J.E. (2015). Textbook of Medical Physiology (13th ed.). Elsevier/Saunders.',
  nernst_1888:   'Nernst, W. (1888). Zur Kinetik der in Lösung befindlichen Körper. Zeitschrift für Physikalische Chemie, 2(9), 613–637.',
  goldman_1943:  'Goldman, D.E. (1943). Potential, impedance, and rectification in membranes. Journal of General Physiology, 27(1), 37–60.',
  hodgkin_katz:  'Hodgkin, A.L. & Katz, B. (1949). The effect of sodium ions on the electrical activity of the giant axon of the squid. Journal of Physiology, 108(1), 37–77.',
  westerhof_2009:'Westerhof, N., Lankhaar, J.W. & Westerhof, B.E. (2009). The arterial Windkessel. Medical & Biological Engineering & Computing, 47(2), 131–141.',
  korteweg_1878: 'Korteweg, D.J. (1878). Ueber die Fortpflanzungsgeschwindigkeit des Schalles in elastischen Röhren. Annalen der Physik und Chemie, Neue Folge, 5, 525–542.',
  michaelis_1913:'Michaelis, L. & Menten, M.L. (1913). Die Kinetik der Invertinwirkung. Biochemische Zeitschrift, 49, 333–369.',
  hill_1910:     'Hill, A.V. (1910). The possible effects of the aggregation of the molecules of haemoglobin on its dissociation curves. Journal of Physiology, 40(Supplement), iv–vii.',
  rowland_pk:    'Rowland, M. & Tozer, T.N. (2011). Clinical Pharmacokinetics and Pharmacodynamics (4th ed.). Lippincott Williams & Wilkins.',
  pijls_1996:    'Pijls, N.H.J., De Bruyne, B. et al. (1996). Measurement of fractional flow reserve to assess the functional severity of coronary-artery stenoses. New England Journal of Medicine, 334(26), 1703–1708.',
  henderson_1908:'Henderson, L.J. (1908). Concerning the relationship between the strength of acids and their capacity to preserve neutrality. American Journal of Physiology, 21(2), 173–179.',
  hasselbalch:   'Hasselbalch, K.A. (1917). Die Berechnung der Wasserstoffzahl des Blutes aus der freien und gebundenen Kohlensäure desselben. Biochemische Zeitschrift, 78, 112–144.',

  /* ── Control systems / dynamics ─────────────────────────── */
  ziegler_1942:  'Ziegler, J.G. & Nichols, N.B. (1942). Optimum settings for automatic controllers. Transactions of the ASME, 64, 759–768.',
  tyreus_1992:   'Tyreus, B.D. & Luyben, W.L. (1992). Tuning PI controllers for integrator/dead time processes. Industrial & Engineering Chemistry Research, 31(11), 2625–2628.',
  franklin:      'Franklin, G.F., Powell, J.D. & Emami-Naeini, A. (2019). Feedback Control of Dynamic Systems (8th ed.). Pearson.',
  kalman_1960:   'Kalman, R.E. (1960). On the general theory of control systems. Proceedings of the First International Congress on Automatic Control, 1, 481–492.',
  thomson_vib:   'Thomson, W.T. & Dahleh, M.D. (1997). Theory of Vibrations with Applications (5th ed.). Prentice Hall.',

  /* ── Mathematics & numerical methods ───────────────────── */
  press_nr:      'Press, W.H., Teukolsky, S.A., Vetterling, W.T. & Flannery, B.P. (2007). Numerical Recipes: The Art of Scientific Computing (3rd ed.). Cambridge University Press.',
  abramowitz:    'Abramowitz, M. & Stegun, I.A. (1964). Handbook of Mathematical Functions. National Bureau of Standards Applied Mathematics Series 55. U.S. Government Printing Office.',
  strang:        'Strang, G. (2016). Introduction to Linear Algebra (5th ed.). Wellesley-Cambridge Press.',
  taylor_error:  'Taylor, J.R. (1997). An Introduction to Error Analysis (2nd ed.). University Science Books.',
  metropolis:    'Metropolis, N. & Ulam, S. (1949). The Monte Carlo method. Journal of the American Statistical Association, 44(247), 335–341.',
  kreyszig:      'Kreyszig, E. (2011). Advanced Engineering Mathematics (10th ed.). Wiley.',

  /* ── Statistics ─────────────────────────────────────────── */
  cohen_1988:    'Cohen, J. (1988). Statistical Power Analysis for the Behavioral Sciences (2nd ed.). Lawrence Erlbaum Associates.',
  pearson_1900:  'Pearson, K. (1900). On the criterion that a given system of deviations from the probable in the case of a correlated system of variables is such that it can be reasonably supposed to have arisen from random sampling. Philosophical Magazine, 50(302), 157–175.',
  fisher_1925:   'Fisher, R.A. (1925). Statistical Methods for Research Workers. Oliver & Boyd.',
  casella:       'Casella, G. & Berger, R.L. (2002). Statistical Inference (2nd ed.). Duxbury Press.',
  willmott_2005: 'Willmott, C.J. & Matsuura, K. (2005). Advantages of the mean absolute error (MAE) over the root mean square error (RMSE) in assessing average model performance. Climate Research, 30(1), 79–82.',

  /* ── Signal processing ──────────────────────────────────── */
  cooley_tukey:  'Cooley, J.W. & Tukey, J.W. (1965). An algorithm for the machine calculation of complex Fourier series. Mathematics of Computation, 19(90), 297–301.',
  nyquist_1928:  'Nyquist, H. (1928). Certain topics in telegraph transmission theory. Transactions of the American Institute of Electrical Engineers, 47(2), 617–644.',
  shannon_1949:  'Shannon, C.E. (1949). Communication in the presence of noise. Proceedings of the IRE, 37(1), 10–21.',
  hrv_taskforce: 'Task Force of the European Society of Cardiology and the North American Society of Pacing and Electrophysiology (1996). Heart rate variability: Standards of measurement, physiological interpretation, and clinical use. Circulation, 93(5), 1043–1065.',
  proakis:       'Proakis, J.G. & Manolakis, D.K. (2006). Digital Signal Processing (4th ed.). Pearson.',

  /* ── FEA / meshing ──────────────────────────────────────── */
  roache_1994:   'Roache, P.J. (1994). Perspective: A method for uniform reporting of grid refinement studies. Journal of Fluids Engineering, 116(3), 405–413.',
  celik_2008:    'Celik, I.B., Ghia, U., Roache, P.J. et al. (2008). Procedure for estimation and reporting of uncertainty due to discretization in CFD applications. Journal of Fluids Engineering, 130(7), 078001.',
  chopra:        'Chopra, A.K. (2016). Dynamics of Structures: Theory and Applications to Earthquake Engineering (5th ed.). Pearson.',
  zienkiewicz:   'Zienkiewicz, O.C. & Taylor, R.L. (2000). The Finite Element Method (5th ed.). Butterworth-Heinemann.',

  /* ── Aerospace ───────────────────────────────────────────── */
  anderson_flight:'Anderson, J.D. (2017). Introduction to Flight (8th ed.). McGraw-Hill.',
  tsiolkovsky:   'Tsiolkovsky, K.E. (1903). The exploration of cosmic space by means of reaction devices (Issledovanie mirovykh prostranstv reaktivnymi priborami). Nauchnoye Obozreniye (Science Review), No. 5.',
  hohmann_1925:  'Hohmann, W. (1925). Die Erreichbarkeit der Himmelskörper. Oldenbourg, Munich.',
  bate_astro:    'Bate, R.R., Mueller, D.D. & White, J.E. (1971). Fundamentals of Astrodynamics. Dover Publications.',

  /* ── Acoustics & optics ─────────────────────────────────── */
  sabine_1900:   'Sabine, W.C. (1900). Reverberation. The American Architect and Building News, 68(1249).',
  kinsler:       'Kinsler, L.E., Frey, A.R., Coppens, A.B. & Sanders, J.V. (2000). Fundamentals of Acoustics (4th ed.). Wiley.',
  hecht_optics:  'Hecht, E. (2016). Optics (5th ed.). Pearson.',
  abbe_1873:     'Abbe, E. (1873). Beiträge zur Theorie des Mikroskops und der mikroskopischen Wahrnehmung. Archiv für Mikroskopische Anatomie, 9, 413–468.',

  /* ── Laboratory & research ──────────────────────────────── */
  skoog:          'Skoog, D.A., West, D.M., Holler, F.J. & Crouch, S.R. (2014). Fundamentals of Analytical Chemistry (9th ed.). Brooks/Cole.',
  wallace_pcr:    'Wallace, R.B. et al. (1979). Hybridization of synthetic oligodeoxyribonucleotides to phi chi 174 DNA: the effect of single base pair mismatch. Nucleic Acids Research, 6(11), 3543–3557.',
  rychlik_pcr:    'Rychlik, W., Spencer, W.J. & Rhoads, R.E. (1990). Optimization of the annealing temperature for DNA amplification in vitro. Nucleic Acids Research, 18(21), 6409–6412.',
  santalucia_1998:'SantaLucia, J. Jr. (1998). A unified view of polymer, dumbbell, and oligonucleotide DNA nearest-neighbor thermodynamics. Proceedings of the National Academy of Sciences, 95(4), 1460–1465.',
  freshney:       'Freshney, R.I. (2016). Culture of Animal Cells: A Manual of Basic Technique and Specialized Applications (7th ed.). Wiley-Blackwell.',
  hosmer:         'Hosmer, D.W., Lemeshow, S. & Sturdivant, R.X. (2013). Applied Logistic Regression (3rd ed.). Wiley.',
  nist_sp811:     'Thompson, A. & Taylor, B.N. (2008). Guide for the Use of the International System of Units (SI). NIST Special Publication 811. National Institute of Standards and Technology.',
  hirsch_2005:    'Hirsch, J.E. (2005). An index to quantify an individual\'s scientific research output. Proceedings of the National Academy of Sciences, 102(46), 16569–16572.',
  williams_tem:   'Williams, D.B. & Carter, C.B. (2009). Transmission Electron Microscopy: A Textbook for Materials Science (2nd ed.). Springer.',
  beer_johnston:  'Beer, F.P. & Johnston, E.R. (2013). Mechanics of Materials (6th ed.). McGraw-Hill.',
};

/* ================================================================
   CALC_REFS — maps calc function name or section id to refs.
   Function name is checked first; section id is the fallback.
================================================================ */
const CALC_REFS = {

  /* ── Fluid mechanics ───────────────────────────────────── */
  'ypCalc':      [_R.schlichting, _R.menter_sst],
  'ysCalc':      [_R.schlichting, _R.menter_sst],
  'yplus':       [_R.schlichting, _R.menter_sst],   // section fallback

  'reCalc':      [_R.reynolds_1883, _R.white_fm],
  'maCalc':      [_R.anderson_comp, _R.shapiro],
  'deCalc':      [_R.dean_1928, _R.white_fm],
  'peCalc':      [_R.bird_transport, _R.white_fm],
  'stCalc':      [_R.white_fm],
  'reynolds':    [_R.white_fm, _R.schlichting],

  'tbCalc':      [_R.wilcox, _R.menter_sst],
  'tiCalc':      [_R.wilcox, _R.menter_sst],
  'lsCalc':      [_R.wilcox, _R.menter_sst],
  'turbulence':  [_R.wilcox, _R.menter_sst],

  'blCalc':      [_R.schlichting, _R.blasius_1908],
  'leCalc':      [_R.schlichting, _R.white_fm],
  'boundary-layer': [_R.schlichting],

  'hpCalc':      [_R.hagen_1839, _R.poiseuille_1840, _R.white_fm],
  'dwCalc':      [_R.moody_1944, _R.colebrook_1939],
  'dhCalc':      [_R.white_fm, _R.incropera],
  'pipe-flow':   [_R.white_fm, _R.batchelor],

  'plCalc':      [_R.cho_kensey, _R.carreau_1972],
  'caCalc':      [_R.cho_kensey, _R.carreau_1972],
  'nvCalc':      [_R.cho_kensey, _R.bird_transport],
  'non-newt':    [_R.cho_kensey, _R.carreau_1972],

  'woCalc':      [_R.womersley_1955, _R.nichols_blood],
  'wssCalc':     [_R.white_fm, _R.bird_transport],
  'osiCalc':     [_R.ku_osi_1985, _R.nichols_blood],
  'pulsatile':   [_R.womersley_1955, _R.nichols_blood],

  'pmCalc':      [_R.darcy_1856, _R.kozeny_carman],
  'fchCalc':     [_R.forchheimer, _R.ergun_1952],
  'porous':      [_R.darcy_1856, _R.kozeny_carman],

  /* ── Structural FEA ────────────────────────────────────── */
  'elCalc':      [_R.timoshenko_elast],
  'elastic':     [_R.timoshenko_elast],

  'vmCalc':      [_R.von_mises_1913, _R.timoshenko_elast],
  'pvCalc':      [_R.timoshenko_elast, _R.roark],
  'stress':      [_R.timoshenko_elast],

  'bmCalc':      [_R.roark, _R.timoshenko_elast],
  'bmAutoCalc':  [_R.roark],
  'smaCalc':     [_R.roark, _R.timoshenko_elast],
  'beam':        [_R.roark],

  /* ── Heat transfer ─────────────────────────────────────── */
  'htCondFlat':     [_R.fourier_1822, _R.incropera],
  'htCondFlatAuto': [_R.fourier_1822, _R.incropera],
  'htCondCyl':      [_R.fourier_1822, _R.incropera],
  'htConvPipe':     [_R.dittus_1930, _R.incropera],
  'htConvPlate':    [_R.incropera],
  'htRad':          [_R.incropera],
  'finCalc':        [_R.incropera],
  'biCalc':         [_R.incropera],
  'foCalc':         [_R.incropera],
  'lcCalc':         [_R.incropera],
  'lmtdCalc':       [_R.incropera],
  'lmtdParCalc':    [_R.incropera],
  'entuCalc':       [_R.incropera],
  'fickCalc':       [_R.fick_1855, _R.bird_transport],
  'scCalc':         [_R.bird_transport, _R.incropera],
  'shCalc':         [_R.incropera, _R.bird_transport],
  'mflxCalc':       [_R.bird_transport, _R.incropera],
  'heat-transfer':  [_R.incropera],

  /* ── Psychrometrics / HVAC ─────────────────────────────── */
  'psyCalc':        [_R.ashrae_2021, _R.cengel_thermo],
  'psyHeatCalc':    [_R.ashrae_2021, _R.cengel_thermo],
  'psyCoolCalc':    [_R.ashrae_2021, _R.cengel_thermo],
  'psyHumidCalc':   [_R.ashrae_2021, _R.cengel_thermo],
  'psyMixCalc':     [_R.ashrae_2021, _R.cengel_thermo],
  'hvac':           [_R.ashrae_2021, _R.cengel_thermo],

  /* ── Advanced mechanics ────────────────────────────────── */
  'fracCalc':       [_R.irwin_1957, _R.anderson_fracture],
  'fatCalc':        [_R.basquin_1910, _R.suresh_fatigue, _R.shigley],
  'torCalcSolid':   [_R.timoshenko_elast, _R.roark],
  'torCalcHollow':  [_R.timoshenko_elast, _R.roark],
  'pvCalcLame':     [_R.timoshenko_elast],
  'buckleCalc':     [_R.timoshenko_stab, _R.roark],
  'fracture':       [_R.anderson_fracture, _R.timoshenko_elast],

  /* ── Electrical engineering ────────────────────────────── */
  'ohmCalc':        [_R.ohm_1827, _R.nilsson],
  'rcCalc':         [_R.nilsson],
  'rcAutoCalc':     [_R.nilsson],
  'rlCalc':         [_R.nilsson],
  'rlcCalc':        [_R.nilsson],
  'dbCalc':         [_R.nilsson],
  'dbmCalc':        [_R.nilsson],
  'dbmRevCalc':     [_R.nilsson],
  'opampInv':       [_R.horowitz],
  'opampNoninv':    [_R.horowitz],
  'opampDiff':      [_R.horowitz],
  'electrical':     [_R.nilsson],

  /* ── Biomedical engineering ────────────────────────────── */
  'coCalc':         [_R.guyton_hall, _R.nichols_blood],
  'poisCalc':       [_R.batchelor, _R.white_fm],
  'nernstCalc':     [_R.nernst_1888, _R.guyton_hall],
  'goldmanCalc':    [_R.goldman_1943, _R.hodgkin_katz],
  'wkCalc':         [_R.westerhof_2009, _R.nichols_blood],
  'pwvCalc':        [_R.korteweg_1878, _R.nichols_blood],
  'mmCalc':         [_R.michaelis_1913],
  'hillCalc':       [_R.hill_1910],
  'cdtCalc':        [_R.freshney],
  'cdtPredCalc':    [_R.freshney],
  'pkCalc':         [_R.rowland_pk],
  'doseCalc':       [_R.rowland_pk],
  'cfrCalc':        [_R.pijls_1996, _R.nichols_blood],
  'hhCalc':         [_R.henderson_1908, _R.hasselbalch],
  'biomedical':     [_R.guyton_hall, _R.nichols_blood],

  /* ── Dynamics & control ────────────────────────────────── */
  'msdCalc':        [_R.thomson_vib],
  'projCalc':       [_R.kreyszig],
  'dynamics':       [_R.thomson_vib],

  'pidCalc':        [_R.ziegler_1942, _R.tyreus_1992],
  'sosCalc':        [_R.franklin],
  'gpmCalc':        [_R.franklin],
  'cobCalc':        [_R.kalman_1960, _R.franklin],
  'control-sys':    [_R.franklin],

  /* ── Civil / geotechnical ──────────────────────────────── */
  'mannRect':       [_R.manning_1891],
  'mannCirc':       [_R.manning_1891],
  'darcyCalc':      [_R.darcy_1856],
  'civil':          [_R.manning_1891, _R.darcy_1856],

  /* ── Geometry ──────────────────────────────────────────── */
  'geometry':       [_R.beer_johnston, _R.roark, _R.kreyszig],

  /* ── Calculus ──────────────────────────────────────────── */
  'numDiff':        [_R.press_nr, _R.abramowitz],
  'numInt':         [_R.press_nr, _R.abramowitz],
  'taylorCalc':     [_R.abramowitz, _R.press_nr],
  'vcGrad':         [_R.kreyszig],
  'vcDiv':          [_R.kreyszig],
  'vcCurl':         [_R.kreyszig],
  'calculus':       [_R.press_nr, _R.kreyszig],

  /* ── Unit converters ───────────────────────────────────── */
  'units':          ['BIPM (2019). The International System of Units (SI) (9th ed.). Bureau International des Poids et Mesures.', _R.nist_sp811],

  /* ── Mathematics & numerical ───────────────────────────── */
  'qdCalc':         [_R.abramowitz],
  'sleCalc':        [_R.strang],
  'matCalc':        [_R.strang],
  'errpCalc':       [_R.taylor_error],
  'mcuCalc':        [_R.metropolis],
  'math-tools':     [_R.abramowitz, _R.press_nr],

  /* ── Statistics ─────────────────────────────────────────── */
  'ciCalc':         [_R.casella],
  'ssCalc':         [_R.cohen_1988, _R.casella],
  'cohCalc':        [_R.cohen_1988],
  'chiCalc':        [_R.pearson_1900, _R.fisher_1925],
  'rmseCalc':       [_R.willmott_2005],
  'logfCalc':       [_R.hosmer, _R.casella],
  'powerCalc':      [_R.cohen_1988],
  'anovaCalc':      [_R.fisher_1925, _R.casella],
  'statistics':     [_R.casella, _R.fisher_1925],

  /* ── Signal processing ──────────────────────────────────── */
  'rmsCalc':        [_R.proakis],
  'nyqCalc':        [_R.nyquist_1928, _R.shannon_1949],
  'mavCalc':        [_R.proakis],
  'hrvCalc':        [_R.hrv_taskforce],
  'fftCalc':        [_R.cooley_tukey, _R.proakis],
  'signal-proc':    [_R.proakis, _R.nyquist_1928],

  /* ── Mechanical design ──────────────────────────────────── */
  'grCalc':         [_R.shigley],
  'brgCalc':        [_R.shigley],
  'boltCalc':       [_R.shigley],
  'sprCalc':        [_R.shigley],
  'htzCalc':        [_R.hertz_1882, _R.johnson_contact],
  'thrCalc':        [_R.shigley],
  'mech-design':    [_R.shigley],

  /* ── Materials engineering ──────────────────────────────── */
  'romCalc':        [_R.voigt_reuss],
  'temCalc':        [_R.timoshenko_bimetal, _R.timoshenko_elast],
  'crpCalc':        [_R.norton_creep],
  'lmpCalc':        [_R.larson_miller],
  'tsaiCalc':       [_R.tsai_wu_1971],
  'materials-eng':  [_R.tsai_wu_1971, _R.timoshenko_elast],

  /* ── Compressible flow ──────────────────────────────────── */
  'cflCalc':        [_R.courant_1928, _R.anderson_comp],
  'isoCalc':        [_R.shapiro, _R.anderson_comp],
  'nshCalc':        [_R.shapiro, _R.anderson_comp],
  'oshCalc':        [_R.shapiro, _R.anderson_comp],
  'pmeCalc':        [_R.shapiro, _R.anderson_comp],
  'fanCalc':        [_R.shapiro],
  'rayCalc':        [_R.shapiro],
  'pmpCalc':        [_R.white_fm],
  'cavCalc':        [_R.white_fm],
  'stkCalc':        [_R.batchelor],
  'dim3Calc':       [_R.white_fm],
  'compressible-flow': [_R.shapiro, _R.anderson_comp],

  /* ── Mass transfer ──────────────────────────────────────── */
  'mass-transfer':  [_R.bird_transport, _R.fick_1855],

  /* ── Chemical engineering ───────────────────────────────── */
  'iglCalc':        [_R.smith_cet],
  'antCalc':        [_R.antoine_1888, _R.smith_cet],
  'cstrCalc':       [_R.levenspiel],
  'pfrCalc':        [_R.levenspiel],
  'damCalc':        [_R.levenspiel],
  'vdwCalc':        [_R.vdw_1873, _R.smith_cet],
  'chem-eng':       [_R.levenspiel, _R.smith_cet],

  /* ── FEA / meshing ──────────────────────────────────────── */
  'gciCalc':        [_R.roache_1994, _R.celik_2008],
  'arqCalc':        [_R.zienkiewicz],
  'exptsCalc':      [_R.courant_1928],
  'mpfCalc':        [_R.chopra],
  'fea-tools':      [_R.roache_1994, _R.zienkiewicz],

  /* ── Aerospace ───────────────────────────────────────────── */
  'ldCalc':         [_R.anderson_flight],
  'stallCalc':      [_R.anderson_flight],
  'rktCalc':        [_R.tsiolkovsky],
  'orbCalc':        [_R.bate_astro],
  'hohCalc':        [_R.hohmann_1925, _R.bate_astro],
  'aerospace':      [_R.anderson_flight, _R.bate_astro],

  /* ── Acoustics & optics ─────────────────────────────────── */
  'splCalc':        [_R.kinsler],
  'rtCalc':         [_R.sabine_1900, _R.kinsler],
  'lensCalc':       [_R.hecht_optics],
  'opresCalc':      [_R.abbe_1873, _R.hecht_optics],
  'acoustics-optics': [_R.kinsler, _R.hecht_optics],

  /* ── Lab & research ─────────────────────────────────────── */
  'dilCalc':        [_R.skoog],
  'molCalc':        [_R.skoog],
  'pcrCalc':        [_R.santalucia_1998, _R.wallace_pcr, _R.rychlik_pcr],
  'scbCalc':        [_R.williams_tem],
  'hidxCalc':       [_R.hirsch_2005],
  'dpiCalc':        [_R.nist_sp811],
  'lab-tools':      [_R.skoog],
};

/* ================================================================
   initCardReferences()
   Walks every .card, resolves its references, then:
   – appends a (?) button to the card header
   – inserts a hidden ref panel between header and body
   The panel toggles on (?) click.
================================================================ */
function initCardReferences() {
  document.querySelectorAll('.card').forEach(card => {
    /* Resolve refs: try calc function name first, then section ID. */
    const refs = _refsForCard(card);
    if (!refs || refs.length === 0) return;

    /* Build the reference panel (inserted between header and body). */
    const panel = document.createElement('div');
    panel.className = 'ref-panel';
    const items = refs.map(r => `<li>${r}</li>`).join('');
    panel.innerHTML =
      `<span class="ref-panel-label">Key References</span>` +
      `<ol class="ref-list">${items}</ol>`;

    const body = card.querySelector('.card-body');
    if (body) card.insertBefore(panel, body);
    else card.appendChild(panel);

    /* Add (?) button to the card header. */
    const header = card.querySelector('.card-header');
    if (!header) return;
    const btn = document.createElement('button');
    btn.className = 'card-ref-btn';
    btn.title = 'View source references';
    btn.textContent = '?';
    btn.addEventListener('click', () => {
      const open = panel.classList.toggle('open');
      btn.classList.toggle('active', open);
    });
    header.appendChild(btn);
  });
}

/* Resolve refs for a card: check each onclick button's function name,
   then fall back to the parent section id. */
function _refsForCard(card) {
  /* Try every [onclick] element in the card (buttons, selects with onchange). */
  const onclickEls = card.querySelectorAll('[onclick]');
  for (const el of onclickEls) {
    const m = (el.getAttribute('onclick') || '').match(/^(\w+)\(/);
    if (m && CALC_REFS[m[1]]) return CALC_REFS[m[1]];
  }
  /* Fallback: section id. */
  const sec = card.closest('.section[id]');
  if (sec && CALC_REFS[sec.id]) return CALC_REFS[sec.id];
  return null;
}
