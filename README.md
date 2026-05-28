# eng-fea-cfd-calc

**Engineering FEA / CFD Calculator Hub** — 82+ client-side engineering calculators across 13 disciplines.

Part of the [A. Mirza academic tools portfolio](https://dthornz.github.io/website-cv-tools/).

**Live:** [dthornz.github.io/eng-fea-cfd-calc](https://dthornz.github.io/eng-fea-cfd-calc/)

---

All calculators run entirely in the browser — no server, no data sent anywhere.

### Fluid Mechanics
Y+ / Y* wall units · Reynolds / Mach / Strouhal / Dean / Péclet numbers · Turbulence inlet BCs (k, ε, ω, νₜ) · Turbulence intensity & length scale · Boundary layer (Blasius + Schlichting) · Pipe entry / development length · Hagen-Poiseuille (Q↔ΔP) · Darcy-Weisbach (Moody friction) · Hydraulic diameter

### Biomedical CFD
Power Law & Carreau viscosity models (blood, Cho & Kensey parameters) · Newtonian validity check (γ̇ threshold) · Womersley number · Wall shear stress from Q or ΔP · OSI / TAWSS from pasted time-series

### Porous Media Flow
Darcy's Law + Kozeny–Carman permeability (k = ε³dp²/[180(1−ε)²]) · Forchheimer inertial correction (ΔP/L = μu/k + βρu²) · Ergun β coefficient · Pore Reynolds number validity check

### Structural FEA
Isotropic elastic constants conversion (E, ν, G, K, λ) · Von Mises + Tresca + safety factor · Pressure vessel (thin-wall + Lamé thick-wall + column buckling) · Beam deflection (cantilever, simply supported, UDL) · Second moment of area (rectangle, circle, hollow, I-beam)

### Thermodynamics
Fourier conduction / thermal resistance · Forced convection — Nusselt / h · Thermal radiation — Stefan-Boltzmann · Extended surface (fin) efficiency

### Advanced Mechanics
Stress intensity factor — Mode I (fracture) · Fatigue life — Basquin S-N · Torsion of circular shaft · Thick-wall pressure vessel & column buckling

### Electrical Engineering
Ohm's Law & DC power · RC / RL / RLC circuits (transient + impedance) · Decibels & signal levels · Op-Amp configurations (inverting, non-inverting, difference, integrator)

### Biomedical Engineering
Cardiovascular hemodynamics (Poiseuille-based Q, ΔP, resistance) · Nernst equation · Goldman equation (multi-ion membrane potential)

### Dynamics & Control
Mass-spring-damper system (natural frequency, damping ratio, step response) · Projectile motion

### Civil Engineering
Manning's open-channel flow · Darcy's Law — groundwater seepage

### Geometry
2D shape properties (area, perimeter, centroid) · 3D shape properties (volume, surface area) · Triangle solver (Law of Cosines / Sines, auto-solve) · Coordinate geometry

### Calculus
Numerical differentiation · Numerical integration · Taylor series approximation · Vector calculus — gradient, divergence, curl

### Unit Converters (live, type-to-convert)
Pressure · Dynamic viscosity · Kinematic viscosity · Velocity · Length · Force · Density · Temperature (°C / °F / K / °R)

---

### UI Features
Unit system switcher (SI / MMKS / CGS / IPS / BIN / BFT) — sets preferred units across all calculators · Live card search — filter by keyword across titles, subtitles, and input labels · Unit auto-convert — changing a unit selector converts the current field value automatically · Resizable cards — drag the bottom-right corner to resize any card · Restore button (↺) on each card — resets size and all inputs to defaults

**Tech:** Vanilla HTML/CSS/JS · No build step · GitHub Pages

---

© 2026 Asad Mirza, Ph.D. · Research Assistant Professor · FIU Biomedical Engineering
