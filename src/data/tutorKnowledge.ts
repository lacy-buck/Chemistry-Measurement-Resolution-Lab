/**
 * Knowledge Base for Standalone Chemistry Lab Tutor.
 * Provides instant, expert pedagogical explanations for scale resolution,
 * significant figures, meniscus reading, and laboratory measurement principles
 * without requiring any backend server, external API keys, or network connection.
 */

interface QAEntry {
  keywords: string[];
  reply: string;
}

const TUTOR_KNOWLEDGE_BASE: QAEntry[] = [
  {
    keywords: ['trailing zero', '4.00', '5.00', '5.0', '4 cm', 'on the line', 'squarely', 'exact line'],
    reply: `**Why Trailing Zeros Matter in Science (vs. Math):**

• **In Math Class:** 4 = 4.0 = 4.00 (all equal numbers).
• **In Chemistry & Physics:** They tell three completely different stories about your instrument's scale resolution!
  - Writing **"4 cm"** implies you estimated the ones place on an unmarked stick with ±1 cm resolution.
  - Writing **"4.0 cm"** means the instrument has 1 cm divisions, and you estimated the tenths place.
  - Writing **"4.00 cm"** on a millimeter ruler (0.1 cm markings) proves you read the 4.0 cm mark with certainty and estimated that the edge landed exactly on the line (**0** in the hundredths place).

⚠️ **Golden Rule:** Never drop trailing zeros! Doing so falsely claims your instrument had coarser markings than it actually did.`,
  },
  {
    keywords: ['which decimal', 'decimal place', 'how many decimal', 'estimate to', 'determine decimal', 'last digit'],
    reply: `**How to Determine Which Decimal Place to Estimate To:**

1. **Find the Smallest Scale Division (Minor Tick):**
   Subtract two numbered lines and divide by the number of spaces between them.
2. **Apply the 1/10th Estimation Rule:**
   In scientific measurement, you always record all certain digits from printed marks PLUS **one estimated digit** between the marks (usually to the nearest 1/10th of a division):
   - **Divisions of 1 unit (e.g. 1 cm or 1 mL):** Estimate to tenths place (**0.1**). Record with **1 decimal place** (e.g., 6.4 mL).
   - **Divisions of 0.1 unit (e.g. 1 mm or 0.1 mL):** Estimate to hundredths place (**0.01**). Record with **2 decimal places** (e.g., 6.45 mL).
   - **Divisions of 0.2 unit (e.g. 25 mL cylinder):** Markings are 0.2 mL apart. Values end in hundredths (e.g., 14.45 mL).
   - **Divisions of 10 or 20 units (e.g. beakers):** Estimate to the nearest 1 to 5 units (whole numbers, **0 decimal places**).`,
  },
  {
    keywords: ['beaker', 'graduated cylinder', 'more accurate', 'beaker vs', 'cylinder vs', 'narrow'],
    reply: `**Why Graduated Cylinders Outperform Beakers for Volume:**

• **Narrow Column vs. Wide Vat:**
  A graduated cylinder has a narrow cross-sectional diameter. A volume change of even 0.1 mL creates a visible change in the liquid height! In a wide beaker, 0.1 mL of liquid spread over the broad base is virtually invisible to the naked eye.
• **Scale Calibrations:**
  - Graduated cylinders are manufactured and calibrated specifically to deliver (*TD*) or contain (*TC*) liquid with tight tolerances (typically ±0.5% to ±1%).
  - Beakers have coarse graduation lines (often spaced every 20 mL, 25 mL, or 50 mL) with an approximate tolerance of **±5%**.
• **Proper Lab Role:**
  - **Beakers:** Holding, swirling, heating, mixing, and dissolving.
  - **Graduated Cylinders:** Quantitative volume measurement.`,
  },
  {
    keywords: ['parallax', 'meniscus', 'eye level', 'curve', 'bottom of'],
    reply: `**Reading a Meniscus & Avoiding Parallax Error:**

• **What is Parallax Error?**
  Parallax error is the apparent shift in an object's position when viewed from different viewing angles.
• **How to Read Correctly:**
  1. Bring your eyes directly level with the liquid surface (crouch or adjust the cylinder height—never tilt the glassware!).
  2. For water and aqueous solutions (which adhere to glass), locate the **bottom-most point** of the concave meniscus curve in the center.
  3. If you look from above, you will record an artificially low volume.
  4. If you look from below, you will record an artificially high volume.`,
  },
  {
    keywords: ['certain digit', 'estimated digit', 'how many digits', 'significant figure', 'sig fig', 'meaning of'],
    reply: `**Certain vs. Estimated Digits in Scientific Data:**

• **Certain Digits:**
  These are digits you are 100% confident in because physical graduation lines mark them on the scale.
• **Estimated Digit:**
  The human eye can reliably subdivide the gap between two markings into tenths. By scientific convention, an analog measurement **always reports exactly ONE estimated digit**.
• **Why Not Guess More Digits?**
  Writing two or more unprinted decimal places (e.g. 4.523 cm on a millimeter ruler) is scientifically dishonest because human vision cannot resolve 1/1000th of a millimeter with the naked eye.`,
  },
  {
    keywords: ['precision', 'resolution', 'difference between', 'accuracy'],
    reply: `**Scale Resolution vs. Precision vs. Accuracy:**

• **Scale Resolution:**
  The smallest marked increment on an instrument's scale (e.g., 0.1 cm or 1 mL). Higher resolution allows you to read more decimal places.
• **Measurement Precision:**
  How closely repeated measurements of the same quantity agree with one another (reproducibility across multiple trials).
• **Measurement Accuracy:**
  How close a measured value is to the true or accepted reference value.`,
  },
];

export function getTutorAnswer(userQuestion: string, context?: any): string {
  const query = userQuestion.toLowerCase().trim();

  // Search knowledge base
  for (const entry of TUTOR_KNOWLEDGE_BASE) {
    const matches = entry.keywords.some((kw) => query.includes(kw));
    if (matches) {
      return entry.reply;
    }
  }

  // Context-specific intelligent guidance if general question
  if (context?.activeTab === 'cylinder') {
    return `**Graduated Cylinder Guidance:**
• Always place the cylinder on a flat lab bench and view the meniscus at eye level.
• Read at the lowest point of the concave curve.
• Check the scale markings:
  - 10 mL cylinder (0.1 mL marks) → Record to **2 decimal places** (e.g. 4.25 mL).
  - 25 mL cylinder (0.2 mL marks) → Record to **2 decimal places** (e.g. 14.45 mL).
  - 100 mL cylinder (1 mL marks) → Record to **1 decimal place** (e.g. 45.3 mL).
• Remember to record trailing zeros if the liquid lands right on a line!`;
  }

  if (context?.activeTab === 'ruler') {
    return `**Ruler Measurement Guidance:**
• Align the zero mark carefully with the left edge of the object.
• Read all printed lines (centimeters and millimeters).
• Millimeter rulers have divisions every 0.1 cm (1 mm) → Always record to **2 decimal places** (e.g., 7.42 cm or 7.00 cm).
• Whole-cm rulers have divisions every 1 cm → Always record to **1 decimal place** (e.g., 7.4 cm or 7.0 cm).`;
  }

  if (context?.activeTab === 'beaker') {
    return `**Beaker Guidance:**
• Beakers have wide diameters and large intervals (e.g., 20 mL marks).
• Because of the wide volume surface and ~±5% manufacturing tolerance, beakers are for rough estimates and mixing, not for quantitative analysis.
• Estimate only to the nearest whole number or 5-10 mL interval (0 decimal places).`;
  }

  // Default overarching chemistry mentorship response
  return `**Golden Rule of Chemistry Measurements:**

1. **Read All Certain Digits:** Read the numbers corresponding to the last printed line your measurement has passed.
2. **Add Exactly ONE Estimated Digit:** Estimate the fractional distance (tenths) between that line and the next line.
3. **Keep Trailing Zeros:** If the meniscus or edge falls directly on a line, write trailing zero(s) (e.g., **5.00 cm** or **24.0 mL**) to preserve the instrument's scale resolution!

Feel free to ask about specific instruments, parallax error, beakers vs. cylinders, or why trailing zeros matter.`;
}
