# eng-fea-cfd-calc

**Engineering FEA / CFD Calculator Hub** — 172+ client-side engineering calculators across 27 disciplines.

Part of the [A. Mirza academic tools portfolio](https://dthornz.github.io/website-cv-tools/).

**Live:** [dthornz.github.io/eng-fea-cfd-calc](https://dthornz.github.io/eng-fea-cfd-calc/)

---

All calculators run entirely in the browser — no server, no data sent anywhere.

### Fluid Mechanics
Y+ / Y* wall units · Reynolds / Mach / Strouhal / Dean / Péclet numbers · Turbulence inlet BCs (k, ε, ω, νₜ) · Turbulence intensity & length scale · Boundary layer (Blasius + Schlichting) · Pipe entry / development length · Hagen-Poiseuille (Q↔ΔP) · Darcy-Weisbach (Moody friction) · Hydraulic diameter

### Biomedical CFD
Power Law & Carreau viscosity models (blood, Cho & Kensey parameters) · Newtonian validity check (γ̇ threshold) · Womersley number · Wall shear stress from Q or ΔP · OSI / TAWSS from pasted time-series

### Porous Media Flow
Darcy's Law + Kozeny–Carman permeability · Forchheimer inertial correction · Ergun β coefficient · Pore Reynolds number validity check

### Structural FEA
Isotropic elastic constants (E, ν, G, K, λ) · Von Mises + Tresca + safety factor · Pressure vessel (thin-wall + Lamé thick-wall + column buckling) · Beam deflection (cantilever, simply supported, UDL) · Second moment of area (rectangle, circle, hollow, I-beam)

### Thermodynamics
Fourier conduction / thermal resistance · Forced convection — Nusselt / h · Stefan-Boltzmann radiation · Fin efficiency · Biot number · Fourier number · Lumped capacitance transient · LMTD heat exchanger · ε-NTU method

### Psychrometrics & HVAC
Full moist-air state from any two independent inputs (DBT+RH · DBT+WBT · DBT+DPT · DBT+W · DBT+h) · Altitude → pressure (ISA model) · Outputs: WBT, DPT, RH, W, Pv, Psat, h, v, ρ, degree of saturation, moisture content · ASHRAE comfort zone assessment · Human-readable air-state summary · HVAC process analysis: sensible heating (Q, outlet RH) · cooling with dehumidification (total/sensible/latent load, SHR, condensate rate) · humidification (water flow rate, latent load) · two-stream air mixing (mixed state, condensation risk)

### Advanced Mechanics
Stress intensity factor — Mode I · Fatigue life — Basquin S-N · Torsion of circular shaft · Thick-wall pressure vessel & column buckling

### Electrical Engineering
Ohm's Law & DC power · RC / RL / RLC circuits (transient + impedance) · Decibels & signal levels · Op-Amp configurations (inverting, non-inverting, difference, integrator)

### Biomedical Engineering
Cardiovascular hemodynamics (CO, SVR, Poiseuille) · Nernst & Goldman equations · Windkessel model (2-element) · Pulse wave velocity (Moens-Korteweg) · Michaelis-Menten kinetics · Hill equation (cooperative binding) · Cell doubling time · One-compartment PK model · Loading & maintenance dose · Coronary flow reserve & FFR

### Dynamics & Control
Mass-spring-damper (natural frequency, damping ratio, step response) · Projectile motion

### Civil Engineering
Manning's open-channel flow · Darcy's Law — groundwater seepage

### Geometry
2D shape properties (area, perimeter, centroid) · 3D shape properties (volume, surface area) · Triangle solver (Law of Cosines / Sines) · Coordinate geometry

### Calculus
Numerical differentiation · Numerical integration · Taylor series approximation · Vector calculus — gradient, divergence, curl

### Unit Converters (live, type-to-convert)
Pressure · Dynamic viscosity · Kinematic viscosity · Velocity · Length · Force · Density · Temperature (°C / °F / K / °R)

### Mathematics & Numerical
Quadratic formula (real & complex roots) · System of linear equations — Cramer's rule (2×2 and 3×3) · Matrix properties (determinant, inverse, eigenvalues) · Error propagation (analytical) · Monte Carlo uncertainty

### Statistics & Data Science
Confidence interval (z/t) · Sample size — means & proportions · Cohen's d effect size · Chi-square goodness of fit · RMSE / MAE / R² · Logistic function · Statistical power (z-test) · One-way ANOVA (F-test, η²)

### Signal Processing
RMS & crest factor · Nyquist & aliasing · Moving average smoothing · HRV time-domain metrics (SDNN, RMSSD, pNN50) · Spectral analysis — DFT (dominant frequencies)

### Control Systems
PID tuning — Ziegler-Nichols & Tyreus-Luyben · 2nd-order step response (overshoot, rise & settling time) · Gain & phase margin (Bode) · Controllability & observability (rank test)

### Mechanical Design
Gear ratio (speed, torque, power) · Bearing life — ISO 281 L10 · Bolt preload — nut-factor method (T↔F) · Spring rate — helical coil · Hertz contact stress · Thread engagement length

### Materials Engineering
Rule of mixtures (composite E longitudinal & transverse) · Thermal mismatch stress · Norton creep law · Larson-Miller rupture parameter · Tsai-Wu composite failure criterion

### Compressible Flow & CFD
CFL stability number · Isentropic flow relations · Normal shock (Rankine-Hugoniot) · Oblique shock (θ-β-M) · Prandtl-Meyer expansion · Fanno flow (friction) · Rayleigh flow (heat addition) · Pump affinity laws · NPSH & cavitation risk · Stokes settling velocity · Weber / Capillary / Bond numbers

### Mass Transfer
Fick's first law & diffusion timescale · Schmidt number · Sherwood number (Dittus-Boelter) · Membrane flux (diffusion & filtration/osmosis)

### Chemical Engineering
Ideal gas law (solve for any variable) · Antoine vapor pressure · CSTR reactor design (1st-order) · PFR design (vs. CSTR comparison) · Damköhler number (Da I & II) · Van der Waals real gas (Z-factor)

### FEA & Meshing
Grid Convergence Index (Roache GCI, 3-grid) · Element aspect ratio quality · Explicit stable time-step (structural wave speed & CFD CFL=1) · Modal participation factor & effective mass

### Aerospace
Lift & drag forces · Stall speed · Tsiolkovsky rocket equation (ΔV, mass ratio) · Circular orbit mechanics (period, velocity, escape speed) · Hohmann transfer (ΔV budget, transfer time)

### Acoustics & Optics
Sound pressure level (dB from Pa or W/m²) · Room reverberation time (Sabine RT60) · Thin lens (lensmaker equation & imaging) · Optical resolution (NA, Rayleigh criterion, Abbe limit)

### Laboratory & Research
Dilution calculator (C₁V₁ = C₂V₂, solve any) · Molarity ↔ mass conversion · PCR primer Tm (Wallace rule & nearest-neighbour) · Microscopy scale bar (nm/px) · h-index & i10-index · Print DPI / pixel dimensions · Henderson-Hasselbalch buffer pH

---

### UI Features
Unit system switcher (SI / MMKS / CGS / IPS / BIN / BFT) · Live card search (keyword filter across titles, subtitles, labels) · Unit auto-convert (value converts when unit selector changes) · Resizable cards (drag bottom-right corner) · Restore button (↺) — resets card to defaults

**Tech:** Vanilla HTML/CSS/JS · No build step · GitHub Pages

---

© 2026 Asad Mirza, Ph.D. · Research Assistant Professor · FIU Biomedical Engineering
