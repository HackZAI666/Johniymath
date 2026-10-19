/** Johnly-math — Grade 10 — Introduction to Sets 1 (English edition). */

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function choiceQuestion({ id, before, options, after = ".", answer, explanation }) {
  const optionMarkup = options.map((option) => `
    <button class="inline-choice" type="button" data-choice="${escapeHtml(option.key)}" aria-pressed="false">
      ${option.text}
    </button>`).join('<span class="choice-divider" aria-hidden="true">or</span>');
  return `
    <div class="gap-question" data-question="${escapeHtml(id)}" data-correct="${escapeHtml(answer)}" data-explanation="${escapeHtml(explanation)}">
      <p class="gap-sentence"><span>${before}</span> <span class="inline-choice-group">${optionMarkup}</span> <span>${after}</span></p>
      <p class="question-feedback" aria-live="polite"></p>
    </div>`;
}

function normaliseAnswer(value) {
  return String(value ?? "")
    .toLowerCase()
    .trim()
    .replaceAll("，", ",")
    .replaceAll("；", ";")
    .replaceAll("\\in", "∈")
    .replaceAll("\\notin", "∉")
    .replaceAll("\\emptyset", "∅")
    .replace(/\s+/g, "")
    .replace(/[{}()\[\]]/g, "")
    .replace(/;/g, ",");
}

const examples = [
  {
    id: "ex-roster",
    label: "Example 1 · Build a set",
    scene: "You are cataloguing the first four whole-number tiles in the Archive Room. In this lesson, the natural numbers are N = {0, 1, 2, 3, …}. Write the set of natural numbers that are no greater than 3, using roster notation. Enter the elements in increasing order, separated by commas.",
    placeholder: "For example: 0, 1, 2, 3",
    accepts: ["0,1,2,3"],
    hint: "List every natural number from 0 through 3, and do not add 4.",
    solutionTitle: "Teacher's worked example: roster notation",
    solution: "The condition is ‘natural number and no greater than 3’. Under our stated convention, N includes 0. The qualifying numbers are 0, 1, 2, and 3, so the set is A = {0, 1, 2, 3}. A set must include every object satisfying the condition, not just a few examples."
  },
  {
    id: "ex-empty",
    label: "Example 2 · Discover an empty set",
    scene: "A locked door opens only for real numbers x that satisfy x² + 1 = 0. You must report the set of all real solutions. Type ∅, {}, or the words ‘empty set’.",
    placeholder: "Enter ∅ or empty set",
    accepts: ["∅", "emptyset", "empty set", "{}"],
    hint: "For every real number, x² is at least 0. What does that make x² + 1?",
    solutionTitle: "Teacher's worked example: the empty set",
    solution: "For every real x, x² ≥ 0. Therefore x² + 1 ≥ 1, so it cannot equal 0. There are no real solutions. The solution set is ∅, called the empty set. The answer depends on the number system: if complex numbers were allowed, the equation would have solutions i and −i."
  },
  {
    id: "ex-cardinality",
    label: "Example 3 · Count distinct elements",
    scene: "A museum tray is labelled {2, 2, 3, 3, 3}. The curator asks how many distinct elements the set contains. Enter one number.",
    placeholder: "Number of distinct elements",
    accepts: ["2"],
    hint: "Cross out repeats in your mind. Which different values remain?",
    solutionTitle: "Teacher's worked example: repeated elements",
    solution: "A set records membership, not how many times a value was written. The only distinct values are 2 and 3. Therefore the set has 2 elements and is equal to {2, 3}. Repetition does not create a new element."
  },
  {
    id: "ex-membership",
    label: "Example 4 · Choose the membership symbol",
    scene: "Let A = {2, 4, 6}. The archive scanner checks the number 5. Enter ∈ if 5 belongs to A, or ∉ if it does not.",
    placeholder: "Enter ∈ or ∉",
    accepts: ["∉", "notin", "notin a"],
    hint: "The elements listed in A are exactly 2, 4, and 6.",
    solutionTitle: "Teacher's worked example: membership",
    solution: "Because 5 is not one of the elements 2, 4, or 6, we write 5 ∉ A. The symbol ∈ means ‘is an element of’; ∉ means ‘is not an element of’. The object is written on the left and the set on the right."
  },
  {
    id: "ex-infinite",
    label: "Example 5 · Finite or infinite?",
    scene: "You are following a trail of positive multiples of 6: 6, 12, 18, 24, … . Is the set finite or infinite? Enter ‘finite’ or ‘infinite’.",
    placeholder: "Enter finite or infinite",
    accepts: ["infinite", "infiniteset"],
    hint: "After any multiple you write down, can you produce a larger one by adding 6?",
    solutionTitle: "Teacher's worked example: an infinite set",
    solution: "The positive multiples of 6 are {6n : n is a positive integer}. Given any multiple 6n, the number 6(n + 1) is a larger positive multiple. There is no final element, so the set is infinite. The ellipsis (…) signals that this rule continues."
  },
  {
    id: "ex-clear-rule",
    label: "Example 6 · Repair an unclear rule",
    scene: "A club asks you to make a list of ‘tall students’. That phrase has no agreed height threshold. For this check, replace the unclear phrase with the exact rule ‘students whose recorded height is at least 170 cm’. Type the threshold number and unit, such as 170 cm.",
    placeholder: "Enter the exact threshold",
    accepts: ["170cm", "170centimetres", "170centimeters"],
    hint: "A useful rule gives the same membership decision to different people using the same data.",
    solutionTitle: "Teacher's worked example: make the criterion definite",
    solution: "The original phrase ‘tall students’ can be interpreted differently by different people. A definite criterion such as ‘recorded height ≥ 170 cm’ makes the decision testable. Under this rule, a student recorded at 169 cm is out and a student recorded at exactly 170 cm is in. The threshold is an example of how a vague description can be repaired; other thresholds could be chosen, but they must be stated."
  }
];

const examplesMarkup = examples.map((example) => `
  <article class="student-example" data-example="${escapeHtml(example.id)}" data-accepted="${escapeHtml(JSON.stringify(example.accepts))}" data-hint="${escapeHtml(example.hint)}">
    <div class="student-example-top"><span class="example-stamp">TYPE IT FIRST</span><strong>${escapeHtml(example.label)}</strong></div>
    <p>${escapeHtml(example.scene)}</p>
    <form class="example-answer-form" novalidate>
      <label for="answer-${escapeHtml(example.id)}">Your answer</label>
      <div class="example-answer-row">
        <input id="answer-${escapeHtml(example.id)}" name="answer" type="text" autocomplete="off" spellcheck="false" placeholder="${escapeHtml(example.placeholder)}" required>
        <button type="submit" class="example-submit-button">Check answer</button>
      </div>
      <p class="example-feedback" aria-live="polite"></p>
    </form>
    <div class="example-hint" hidden></div>
    <div class="teacher-solution" hidden><h4>${escapeHtml(example.solutionTitle)}</h4><p>${escapeHtml(example.solution)}</p></div>
  </article>`).join("");

export function renderSetsIntroOne(target, { initialProgress = {}, onProgressChange = () => {} } = {}) {
  if (!(target instanceof HTMLElement)) {
    throw new TypeError("renderSetsIntroOne requires a target HTML element.");
  }
  const completedQuestions = new Set(Array.isArray(initialProgress.completedQuestions) ? initialProgress.completedQuestions : []);
  const completedExamples = new Set(Array.isArray(initialProgress.completedExamples) ? initialProgress.completedExamples : []);

  target.innerHTML = `
    <div class="lesson-course-label">GRADE 10 · SETS AND LOGIC · FOUNDATIONS</div>
    <div class="lesson-immersive-hero">
      <div class="lesson-hero-copy">
        <p class="lesson-kicker">FIELD MISSION 01 · ESTIMATED 45–55 MINUTES</p>
        <h2>The Archive of Number Islands</h2>
        <p>You have been selected as a junior curator at the Archive of Number Islands, a research station that stores objects, numbers, maps, and mathematical records. Overnight, the archive's catalogue became scrambled. Some cards have clear rules; others are vague, duplicated, or missing. Your job is to rebuild the catalogue one decision at a time.</p>
        <p>This is not a speed run. You will explore the rooms, make decisions, and test your ideas. You must answer each worked example <strong>before</strong> its teacher explanation is unlocked. A wrong answer is a clue to reconsider—not a penalty.</p>
        <div class="lesson-meta-row"><span>◉ 9 exploration stops</span><span>✎ 24 quick checks</span><span>⌁ 6 typed examples</span></div>
      </div>
      <div class="lesson-orbit-art" aria-label="A visual map of overlapping sets">
        <svg viewBox="0 0 300 255" role="img" aria-labelledby="set-map-title set-map-desc">
          <title id="set-map-title">A map of the archive</title>
          <desc id="set-map-desc">Two overlapping circular sets labelled A and B, inside a larger universal space.</desc>
          <rect x="9" y="10" width="282" height="230" rx="22" fill="#f7f9ff" stroke="#dce5f8" stroke-width="1.5"/>
          <text x="26" y="34" font-size="10" font-weight="700" fill="#7a87a2" letter-spacing="1.5">THE CATALOGUE MAP</text>
          <circle cx="111" cy="132" r="70" fill="#8eb6ff" fill-opacity=".36" stroke="#4778d7" stroke-width="2.5"/>
          <circle cx="184" cy="132" r="70" fill="#9bdcc8" fill-opacity=".38" stroke="#2f9b7a" stroke-width="2.5"/>
          <circle cx="79" cy="103" r="4" fill="#2457d6"/><circle cx="105" cy="157" r="4" fill="#2457d6"/>
          <circle cx="217" cy="104" r="4" fill="#17815e"/><circle cx="205" cy="163" r="4" fill="#17815e"/>
          <circle cx="146" cy="131" r="5" fill="#6a56c7"/>
          <text x="74" y="77" font-size="19" font-weight="800" fill="#2457d6">A</text>
          <text x="211" y="77" font-size="19" font-weight="800" fill="#17815e">B</text>
          <text x="145" y="191" font-size="11" text-anchor="middle" font-weight="700" fill="#5444a2">shared region</text>
          <path d="M 21 226 Q 62 211 91 225" fill="none" stroke="#c8d3ea" stroke-width="1.5" stroke-linecap="round"/>
          <circle cx="263" cy="218" r="5" fill="#2457d6" opacity=".25"/><circle cx="249" cy="226" r="3" fill="#17815e" opacity=".4"/>
        </svg>
        <div class="orbit-caption"><span class="orbit-dot"></span> Every dot needs a rule.</div>
      </div>
    </div>

    <div class="lesson-progress-card" aria-label="Lesson progress">
      <div class="lesson-progress-top"><strong>Your field log</strong><span><b data-progress-count>0</b> / <span data-progress-total>0</span> tasks mastered</span></div>
      <div class="lesson-progress-track"><div class="lesson-progress-fill" data-progress-fill style="width:0%"></div></div>
      <div class="progress-foot-row"><p data-progress-message>Start with the first room. Your progress is saved under your account in this browser.</p><span class="progress-save-status" data-save-status data-saved="true">Progress saves as you work.</span></div>
    </div>

    <nav class="lesson-station-nav" aria-label="Lesson stations">
      <a href="#station-briefing">Mission Briefing</a><a href="#station-rules">Sorting Hall</a><a href="#station-elements">Element Lab</a><a href="#station-membership">Signal Room</a><a href="#station-size">Infinite Corridor</a><a href="#station-number-world">Number Islands</a><a href="#station-examples">Solve the Archive</a><a href="#station-debrief">Debrief</a>
    </nav>

    <section class="learning-section" id="station-briefing">
      <div class="section-heading"><span class="section-number">01</span><div><p class="lesson-kicker">THE ARRIVAL · ABOUT 4 MINUTES</p><h2>Before you touch a single catalogue card</h2></div></div>
      <p>The archive stands on a quiet island surrounded by fog. Inside, long shelves curve around a central room. One shelf holds numbers, another holds names, and a glass cabinet contains points from different geometric drawings. A senior researcher named Mira hands you a blank catalogue card. “We do not simply pile things together,” she says. “We create a reliable way to decide what belongs in a group.”</p>
      <p>To show you why this matters, Mira tells you the old story of Achilles and the tortoise. Suppose the tortoise starts 1 kilometre ahead, while Achilles runs ten times as fast. By the time Achilles reaches the tortoise's starting point, the tortoise has moved a little farther. By the time Achilles reaches that new point, the tortoise has moved again. The list of remaining distances looks like 1, 1/10, 1/100, 1/1000, and so on. There are infinitely many smaller stages, but the total distance Achilles runs before catching the tortoise is 1 + 1/10 + 1/100 + … = 10/9 kilometres. Infinite stages do not automatically mean an infinite total distance.</p>
      <p>Why begin a lesson on sets with a paradox about motion? Because a mathematician has to distinguish the objects in a problem, the rule connecting them, and the conclusion supported by that rule. The set concept is one of the tools that makes mathematical language precise. Later, when you study sequences and limits, you can revisit the infinite sum in more detail.</p>
      <div class="story-card"><span class="story-label">Your first field note</span><p>Imagine you are standing before a shelf with hundreds of cards. A stranger asks, “Put the important cards together.” You cannot do the job reliably until you know what “important” means. Is it a date, a colour, a topic, or a value? The first lesson of the archive is this: <strong>a classification needs a clear criterion.</strong></p></div>
      ${choiceQuestion({id:"q01",before:"A useful mathematical classification starts with a rule that is",options:[{key:"a",text:"clear enough to test"},{key:"b",text:"different for each person"}],answer:"a",explanation:"The same object should receive the same membership decision when the same rule and information are used."})}
      ${choiceQuestion({id:"q02",before:"The Achilles story suggests that infinitely many stages",options:[{key:"a",text:"always have an infinite total"},{key:"b",text:"can have a finite total"}],answer:"b",explanation:"For this geometric series, 1 + 1/10 + 1/100 + … has the finite sum 10/9. This is an illustration of an infinite process, not a complete course on limits."})}
    </section>

    <section class="learning-section" id="station-rules">
      <div class="section-heading"><span class="section-number">02</span><div><p class="lesson-kicker">THE SORTING HALL · ABOUT 6 MINUTES</p><h2>What belongs on the same shelf?</h2></div></div>
      <p>Mira takes you to the Sorting Hall. On the floor are three circles painted in blue chalk. Beside the first is a card reading “all students registered for Friday's exam”. Beside the second is “all provinces and municipalities listed in the official reference”. The third says “all natural numbers no greater than 100”. Although the objects are different, each description lets you test whether a candidate belongs.</p>
      <p>Now a fourth card arrives: “students who are tall”. Two assistants disagree. One thinks 168 cm counts as tall; the other says the threshold should be 175 cm. Neither assistant is necessarily being careless. The phrase has not supplied a shared criterion. Change it to “students whose recorded height is at least 170 cm”, and the decision becomes testable. If a record says 169 cm, the student is out; if it says exactly 170 cm, the student is in.</p>
      <p>A second damaged card says “some numbers below 100”. Which numbers? The odd ones? The first twenty? The numbers chosen by the person who wrote the card? “Some” does not tell you the whole collection. In set language, we need the collection of all objects that meet the stated condition, not a handful selected without a rule.</p>
      <div class="story-card"><span class="story-label">The rain-window puzzle</span><p>At the station window, the evening forecast is changing. One archivist says, “Put the days when it is likely to rain into this folder.” Another asks, “Does ‘likely’ mean a 40% chance, a 60% chance, or something else?” They decide to define the folder as <em>all days whose forecast probability of rain is at least 40%</em>. Now two people checking the same forecast data can make the same decision. The point is not that 40% is the only sensible threshold; the point is that the threshold is stated clearly enough to apply.</p></div>
      <div class="set-illustration-card">
        <svg viewBox="0 0 340 145" role="img" aria-label="A circle enclosing the elements that satisfy a clear rule">
          <rect x="1" y="1" width="338" height="143" rx="16" fill="#fbfcff" stroke="#e4eaf5"/>
          <text x="18" y="23" font-size="10" font-weight="800" fill="#7886a0" letter-spacing="1">RULE: EVEN NUMBERS BELOW 10</text>
          <circle cx="170" cy="88" r="47" fill="#eaf1ff" stroke="#3d70d5" stroke-width="2.5"/>
          <text x="170" y="57" text-anchor="middle" font-size="12" font-weight="800" fill="#2457d6">A</text>
          <text x="170" y="86" text-anchor="middle" font-size="13" font-weight="700" fill="#25314a">2 · 4 · 6 · 8</text>
          <text x="45" y="80" font-size="12" fill="#8792a7">1</text><text x="67" y="111" font-size="12" fill="#8792a7">3</text><text x="278" y="74" font-size="12" fill="#8792a7">9</text><text x="277" y="108" font-size="12" fill="#8792a7">11</text>
          <path d="M 47 91 l 9 9 m 0 -9 l -9 9" stroke="#c1cadb" stroke-width="1.5" stroke-linecap="round"/><path d="M 278 88 l 9 9 m 0 -9 l -9 9" stroke="#c1cadb" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
        <p class="diagram-caption">The circle is a visual reminder: the rule admits 2, 4, 6, and 8. Numbers outside the circle do not meet this rule.</p>
      </div>
      ${choiceQuestion({id:"q03",before:"The phrase ‘tall students’ is unclear when no height standard is given because it is",options:[{key:"a",text:"subject to different interpretations"},{key:"b",text:"always objectively defined"}],answer:"a",explanation:"A mathematical set must have a definite membership condition. A threshold is one way to make this description precise."})}
      ${choiceQuestion({id:"q04",before:"The set of all two-digit natural numbers ending in 3 must include",options:[{key:"a",text:"every number meeting the rule"},{key:"b",text:"only the numbers you happen to remember"}],answer:"a",explanation:"The word ‘all’ matters. The collection includes 13, 23, 33, 43, 53, 63, 73, 83, and 93."})}
      ${choiceQuestion({id:"q05",before:"A set can contain objects from different categories if each object is clearly identified",options:[{key:"a",text:"true"},{key:"b",text:"false"}],answer:"a",explanation:"A set does not require its elements to look alike. For example, {the Sun, 2, Shanghai} is unusual but still has clearly identified elements."})}
      <div class="mini-challenge"><strong>Pause at the Sorting Hall</strong><p>Think of a group such as “good films”, “difficult questions”, or “nearby shops”. What extra information would make the rule testable? There may be many valid rules, but the rule must be written down before another person can apply it consistently.</p></div>
    </section>

    <section class="learning-section" id="station-elements">
      <div class="section-heading"><span class="section-number">03</span><div><p class="lesson-kicker">THE ELEMENT LAB · ABOUT 5 MINUTES</p><h2>The set, its elements, and the rule of the shelf</h2></div></div>
      <p>At the Element Lab, a set is defined as a collection of distinct objects considered as a whole, where membership is definite. Each object in the collection is called an <strong>element</strong> or a <strong>member</strong> of the set. Mathematicians normally use capital letters such as A, B, and C to name sets, and lower-case letters such as a, b, and c to name elements.</p>
      <p>For example, suppose A is the set of positive integers no greater than 3. We can write A = {1, 2, 3}. The braces indicate that we are writing a set by listing its elements. The rule says exactly which positive integers belong. We do not leave out 2 because it seems ordinary, and we do not add 5 just because we like it: 5 fails the condition.</p>
      <p>A set has two features students often overlook. First, order does not matter: {1, 2, 3} and {3, 1, 2} are the same set because they contain the same elements. Second, repetition does not create extra elements: {1, 2, 2, 3} is also equal to {1, 2, 3}. Sets record which objects belong, not the order in which they arrive or how many times a name was copied.</p>
      <div class="set-illustration-card compact-illustration">
        <svg viewBox="0 0 340 120" role="img" aria-label="Three elements placed inside set A">
          <rect x="1" y="1" width="338" height="118" rx="16" fill="#fbfcff" stroke="#e4eaf5"/>
          <rect x="31" y="24" width="278" height="72" rx="36" fill="#eef3ff" stroke="#6f91df" stroke-width="2"/>
          <text x="47" y="43" font-size="13" font-weight="800" fill="#2457d6">A</text>
          <circle cx="107" cy="61" r="22" fill="#fff" stroke="#8ca8e8" stroke-width="1.8"/><circle cx="170" cy="61" r="22" fill="#fff" stroke="#8ca8e8" stroke-width="1.8"/><circle cx="233" cy="61" r="22" fill="#fff" stroke="#8ca8e8" stroke-width="1.8"/>
          <text x="107" y="66" text-anchor="middle" font-size="14" font-weight="800" fill="#263650">1</text><text x="170" y="66" text-anchor="middle" font-size="14" font-weight="800" fill="#263650">2</text><text x="233" y="66" text-anchor="middle" font-size="14" font-weight="800" fill="#263650">3</text>
        </svg>
        <p class="diagram-caption">A = {1, 2, 3}. Changing the order or repeating an element does not change this set.</p>
      </div>
      ${choiceQuestion({id:"q06",before:"The sets {1, 2, 3} and {3, 2, 1} are",options:[{key:"a",text:"the same set"},{key:"b",text:"different sets"}],answer:"a",explanation:"The elements are identical. A set has no ordering of its elements."})}
      ${choiceQuestion({id:"q07",before:"The set {2, 2, 3, 3, 3} has",options:[{key:"a",text:"two distinct elements"},{key:"b",text:"five distinct elements"}],answer:"a",explanation:"Only the values 2 and 3 are distinct. Writing the same element repeatedly does not create new members."})}
      ${choiceQuestion({id:"q08",before:"Which statement best describes a set?",options:[{key:"a",text:"A definite collection of objects considered as a whole"},{key:"b",text:"Any pile of things, even if nobody knows the rule"}],answer:"a",explanation:"A mathematical set has a definite membership condition. The objects can be numbers, people, places, points, or other clearly identified objects."})}
      <div class="story-card"><span class="story-label">A curator's mistake</span><p>You discover two cards: A = {red, blue, green} and B = {green, red, blue}. A new assistant has marked them as different because the colours appear in a different order. Explain gently why the assistant should compare the members rather than the handwriting order. This is the kind of small but important judgement that keeps the archive accurate.</p></div>
    </section>

    <section class="learning-section" id="station-membership">
      <div class="section-heading"><span class="section-number">04</span><div><p class="lesson-kicker">THE SIGNAL ROOM · ABOUT 5 MINUTES</p><h2>Read the symbols ∈ and ∉</h2></div></div>
      <p>The Signal Room replaces long sentences with compact mathematical symbols. If a is an element of set A, write <strong>a ∈ A</strong>, read “a belongs to A” or “a is an element of A”. If a is not an element of A, write <strong>a ∉ A</strong>. The symbol on the left is the object being checked; the symbol or name on the right is the set.</p>
      <p>Suppose A = {2, 4, 6}. Since 4 is listed, 4 ∈ A. Since 5 is not listed, 5 ∉ A. If a set is described by a rule rather than a list, the same process applies: test the candidate against the rule, then choose the symbol that expresses the result. Do not treat ∈ as a statement that an element equals the entire set. It describes membership.</p>
      <div class="symbol-beacon-card"><div class="symbol-beacon"><span>∈</span><small>IS IN</small></div><div class="symbol-beacon"><span>∉</span><small>IS NOT IN</small></div><p>Say the symbol out loud in your head: “the object belongs to the set” or “the object does not belong to the set”. This turns a visual mark into a precise statement.</p></div>
      ${choiceQuestion({id:"q09",before:"If A = {2, 4, 6}, then 4",options:[{key:"a",text:"∈ A"},{key:"b",text:"∉ A"}],answer:"a",explanation:"The number 4 is explicitly listed as an element of A."})}
      ${choiceQuestion({id:"q10",before:"If A = {2, 4, 6}, then 5",options:[{key:"a",text:"∈ A"},{key:"b",text:"∉ A"}],answer:"b",explanation:"The number 5 is not among 2, 4, and 6."})}
      ${choiceQuestion({id:"q11",before:"The correct reading of 2 ∈ {1, 2, 3} is",options:[{key:"a",text:"2 is an element of the set"},{key:"b",text:"2 is equal to the whole set"}],answer:"a",explanation:"Membership is a relation between an element and a set; it does not say the element is equal to the entire set."})}
      ${choiceQuestion({id:"q12",before:"If C is the set of positive even integers, then 0",options:[{key:"a",text:"∉ C"},{key:"b",text:"∈ C"}],answer:"a",explanation:"The set is specifically defined as positive even integers. Zero is even, but it is not positive, so it fails the full condition."})}
      <div class="mini-challenge"><strong>Signal check</strong><p>Whenever you see a symbol, try translating it into an ordinary sentence before calculating anything else. That small habit helps prevent errors when the notation becomes more complicated in later lessons.</p></div>
    </section>

    <section class="learning-section" id="station-size">
      <div class="section-heading"><span class="section-number">05</span><div><p class="lesson-kicker">THE INFINITE CORRIDOR · ABOUT 6 MINUTES</p><h2>Finite sets, infinite sets, and the empty set</h2></div></div>
      <p>The Infinite Corridor looks like an ordinary hallway, but its doors are labelled with collections of different sizes. A finite set contains only a finite number of elements. The list of students registered for one particular school exam may be long, but it has a finite number of people. “Hard to count quickly” and “infinite” are not the same idea.</p>
      <p>An infinite set has endlessly many distinct elements. Consider the positive multiples of 6: 6, 12, 18, 24, and so on. After any multiple 6n, there is another one, 6(n + 1), which is larger. This gives a rule for always producing a new element; there is no last positive multiple of 6.</p>
      <p>Now consider the positive divisors of 600. Every positive divisor must be one of the positive integers from 1 through 600. Since that candidate list is finite, the divisor set must also be finite. You do not need to list every divisor to know that the number of them is bounded by 600. A good strategy is to look for a finite range or an upper bound instead of guessing based on how large a collection feels.</p>
      <p>One more door is completely empty. A set with no elements is the <strong>empty set</strong>, written ∅ (or sometimes {}). For example, the set of real solutions to x² + 1 = 0 is empty because every real square is at least 0, so x² + 1 is at least 1 and can never equal 0. The empty set is not a failed or unfinished set: the condition has been checked, and no real number qualifies.</p>
      ${choiceQuestion({id:"q13",before:"The positive divisors of 600 form a",options:[{key:"a",text:"finite set"},{key:"b",text:"infinite set"}],answer:"a",explanation:"All positive divisors lie among the 600 positive integers from 1 to 600, so only finitely many values are possible."})}
      ${choiceQuestion({id:"q14",before:"The positive multiples of 6 form an",options:[{key:"a",text:"infinite set"},{key:"b",text:"empty set"}],answer:"a",explanation:"Adding 6 to any positive multiple produces another, different positive multiple. There is no last element."})}
      ${choiceQuestion({id:"q15",before:"In the real numbers, the solution set of x² + 1 = 0 is",options:[{key:"a",text:"the empty set ∅"},{key:"b",text:"an infinite set"}],answer:"a",explanation:"For real x, x² ≥ 0, so x² + 1 ≥ 1. The equation has no real solution."})}
      ${choiceQuestion({id:"q16",before:"A list of every person born in Shanghai in 2019 is, in reality, a",options:[{key:"a",text:"finite set"},{key:"b",text:"infinite set"}],answer:"a",explanation:"A large population is still finite. The number of births in one place over one specific year is finite."})}
      ${choiceQuestion({id:"q17",before:"A line segment of length 1 contains",options:[{key:"a",text:"infinitely many distinct points"},{key:"b",text:"exactly one point"}],answer:"a",explanation:"A finite length does not imply a finite number of points. Between distinct points on the segment, more points can be found."})}
      <div class="story-card"><span class="story-label">Look closely at the glass bridge</span><p>On the bridge, Mira marks the midpoint between two points, then the midpoint of each half, then smaller and smaller intervals again. Every time you think the bridge is “almost full”, new points remain. This picture is a helpful intuition: the length of the bridge and the number of points on it measure different things.</p></div>
      ${choiceQuestion({id:"q18",before:"A set with zero elements is called",options:[{key:"a",text:"the empty set"},{key:"b",text:"an undefined set"}],answer:"a",explanation:"The empty set is a valid set whose membership condition has no qualifying objects."})}
    </section>

    <section class="learning-section" id="station-number-world">
      <div class="section-heading"><span class="section-number">06</span><div><p class="lesson-kicker">THE NUMBER ISLANDS · ABOUT 7 MINUTES</p><h2>Know your number sets: N, Z, Q, and R</h2></div></div>
      <p>The Number Islands sit close together on a map. Each island represents a familiar number set. The letters are shortcuts: once you learn them, you can state membership without repeating a long description every time.</p>
      <div class="number-set-grid">
        <div class="number-set-card"><div class="number-set-symbol">N</div><strong>Natural numbers</strong><p>In this lesson, N = {0, 1, 2, 3, …}. Zero is included under the convention used by the supplied textbook exercise.</p><span>Examples: 0 ∈ N, 7 ∈ N</span></div>
        <div class="number-set-card"><div class="number-set-symbol">Z</div><strong>Integers</strong><p>Negative whole numbers, zero, and positive whole numbers.</p><span>Examples: −3 ∈ Z, 0 ∈ Z, 8 ∈ Z</span></div>
        <div class="number-set-card"><div class="number-set-symbol">Q</div><strong>Rational numbers</strong><p>Numbers that can be written as a/b, where a and b are integers and b ≠ 0.</p><span>Examples: 1/2, −2, 0.75 ∈ Q</span></div>
        <div class="number-set-card"><div class="number-set-symbol">R</div><strong>Real numbers</strong><p>Numbers represented on the real number line, including rational and irrational numbers.</p><span>Examples: −√π, √2, π ∈ R</span></div>
      </div>
      <p>There is one important convention to keep in view. Some textbooks use N for the positive integers only, while others include zero. For this lesson, follow the supplied exercise and use <strong>0 ∈ N</strong>. In your schoolwork, follow the definition your teacher and textbook establish. Never assume a convention without checking the current course.</p>
      <p>Every integer is rational because any integer n can be written as n/1. Thus −2 ∈ Q. The number 0.75 is rational because 0.75 = 3/4. By contrast, √2 is irrational, so √2 ∉ Q, but √2 is still a real number and therefore √2 ∈ R. A radical sign does not automatically mean the value is irrational: √4 = 2, which is rational.</p>
      <div class="set-illustration-card compact-illustration"><svg viewBox="0 0 340 110" role="img" aria-label="A number line from negative three to three"><path d="M 28 59 H 312" stroke="#8b98b0" stroke-width="2" stroke-linecap="round"/><path d="M 305 53 L 313 59 L 305 65" fill="none" stroke="#8b98b0" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><g fill="#2457d6" stroke="#ffffff" stroke-width="2"><circle cx="58" cy="59" r="6"/><circle cx="100" cy="59" r="6"/><circle cx="142" cy="59" r="6"/><circle cx="184" cy="59" r="6"/><circle cx="226" cy="59" r="6"/><circle cx="268" cy="59" r="6"/></g><g font-size="11" text-anchor="middle" fill="#52617a"><text x="58" y="82">−3</text><text x="100" y="82">−2</text><text x="142" y="82">−1</text><text x="184" y="82">0</text><text x="226" y="82">1</text><text x="268" y="82">2</text></g><text x="22" y="23" font-size="10" font-weight="800" fill="#7886a0" letter-spacing="1.2">THE REAL NUMBER LINE</text></svg><p class="diagram-caption">A number set is defined by membership, not by whether a number is positive, familiar, or easy to write.</p></div>
      ${choiceQuestion({id:"q19",before:"Under the convention used in this lesson",options:[{key:"a",text:"0 ∈ N"},{key:"b",text:"0 ∉ N"}],answer:"a",explanation:"This lesson explicitly uses the convention that natural numbers include zero. Always check the convention used in your course."})}
      ${choiceQuestion({id:"q20",before:"The number −2 is rational because",options:[{key:"a",text:"−2 = −2/1"},{key:"b",text:"it is negative"}],answer:"a",explanation:"A rational number can be expressed as a quotient of integers with a non-zero denominator. The sign alone does not determine rationality."})}
      ${choiceQuestion({id:"q21",before:"√2",options:[{key:"a",text:"is not rational, but is real"},{key:"b",text:"is not a real number"}],answer:"a",explanation:"√2 is irrational but lies on the real number line, so √2 ∈ R and √2 ∉ Q."})}
      ${choiceQuestion({id:"q22",before:"The value √4 is",options:[{key:"a",text:"2, a rational number"},{key:"b",text:"irrational just because it has a radical sign"}],answer:"a",explanation:"√4 = 2. Classify the value after simplifying; the presence of a radical symbol alone is not enough."})}
      ${choiceQuestion({id:"q23",before:"Every integer belongs to the rational numbers because",options:[{key:"a",text:"n = n/1"},{key:"b",text:"all rational numbers are positive"}],answer:"a",explanation:"Every integer n can be written as n divided by 1, which fits the definition of a rational number."})}
    </section>

    <section class="learning-section" id="station-examples">
      <div class="section-heading"><span class="section-number">07</span><div><p class="lesson-kicker">THE ARCHIVE TEST · ABOUT 12 MINUTES</p><h2>Your turn: solve first, reveal the teacher's example second</h2></div></div>
      <p>Mira places six sealed cards on the desk. Each card is an example, not a lecture. Before a teacher's worked solution appears, you must submit an answer. If your answer is correct, the card opens and the explanation becomes available. If it is not accepted, you receive a hint and can try again. A mathematical explanation is most useful after you have committed to a line of reasoning of your own.</p>
      <div class="worked-example-intro"><span class="worked-example-seal">YOUR INVESTIGATION</span><p>Read the situation carefully, type the requested answer, then select <strong>Check answer</strong>. Your answer is only checked in this browser. The correct response unlocks the explanation; it does not change a real exam grade.</p></div>
      <div class="student-example-list">${examplesMarkup}</div>
      ${choiceQuestion({id:"q24",before:"The best reason to attempt a worked example before reading its solution is to",options:[{key:"a",text:"test your own reasoning first"},{key:"b",text:"avoid checking whether your answer makes sense"}],answer:"a",explanation:"Trying first helps you identify what you understand and makes the teacher's reasoning easier to compare with your own."})}
    </section>

    <section class="learning-section" id="station-debrief">
      <div class="section-heading"><span class="section-number">08</span><div><p class="lesson-kicker">RETURN TO THE MAP · ABOUT 4 MINUTES</p><h2>Debrief: what a good set must do</h2></div></div>
      <p>The fog is lifting over the Archive of Number Islands. Look back at the catalogue cards you repaired. You now have a practical way to decide whether a description gives a well-defined set: identify the objects, identify the rule, then ask whether the rule makes membership definite. A collection can contain people, numbers, places, or points. It does not need to be visually uniform, but the membership condition must be clear.</p>
      <div class="final-check-card"><h3>Your field checklist</h3><ol><li><strong>Definite membership:</strong> Can I decide whether a candidate object belongs?</li><li><strong>All qualifying objects:</strong> Does the set contain every object that meets the rule?</li><li><strong>Distinct members:</strong> Do I know that reordering or repeating an element does not create a new element?</li><li><strong>Correct symbol:</strong> Can I use ∈ or ∉ to describe membership?</li><li><strong>Size:</strong> Can I distinguish finite, infinite, and empty sets without judging only by appearance?</li><li><strong>Number sets:</strong> Can I identify N, Z, Q, and R under the convention explicitly stated?</li></ol><p>Do not memorise only the answer to one example. Try to explain why the same rule would work for a new example you have never seen. Being able to transfer the idea is the real sign of understanding.</p></div>
      <div class="lesson-finish-card"><div class="finish-icon" aria-hidden="true">✓</div><div><strong>Mission log closed—for now.</strong><p>This learning page deliberately does not add a separate homework sheet. Your checked questions and unlocked examples are saved to your account in this browser. The next lesson can build on these foundations with set notation, relationships between sets, and set operations.</p></div></div>
      <div class="lesson-actions"><button type="button" class="lesson-reset-button" data-reset-lesson>Reset this lesson's saved progress</button><span>Green outlines indicate questions answered correctly. Teacher solutions appear only after a correct response.</span></div>
    </section>
  `;

  const questionNodes = Array.from(target.querySelectorAll(".gap-question"));
  const exampleNodes = Array.from(target.querySelectorAll(".student-example"));
  const totalTasks = questionNodes.length + exampleNodes.length;
  const progressCount = target.querySelector("[data-progress-count]");
  const progressTotal = target.querySelector("[data-progress-total]");
  const progressFill = target.querySelector("[data-progress-fill]");
  const progressMessage = target.querySelector("[data-progress-message]");
  const status = target.querySelector("[data-save-status]");
  if (progressTotal) progressTotal.textContent = String(totalTasks);

  function emitProgress() {
    try {
      onProgressChange({
        completedQuestions: [...completedQuestions],
        completedExamples: [...completedExamples],
      });
    } catch (error) {
      console.error("[Johnly-math] Could not save lesson progress.", error);
      if (status) {
        status.textContent = "Progress could not be saved. Check this browser's storage settings.";
        status.dataset.saved = "false";
      }
    }
  }

  function updateProgress(shouldSave = false) {
    const mastered = questionNodes.filter((node) => completedQuestions.has(node.dataset.question)).length
      + exampleNodes.filter((node) => completedExamples.has(node.dataset.example)).length;
    const ratio = totalTasks > 0 ? (mastered / totalTasks) * 100 : 0;
    if (progressCount) progressCount.textContent = String(mastered);
    if (progressFill) progressFill.style.width = `${ratio}%`;
    if (progressMessage) {
      if (mastered === totalTasks) {
        progressMessage.textContent = "Every task is mastered. Revisit a station and explain the reason behind each answer in your own words.";
      } else if (mastered >= Math.ceil(totalTasks / 2)) {
        progressMessage.textContent = "Good progress. Keep linking each answer to the rule that justifies it, rather than memorising the choice.";
      } else {
        progressMessage.textContent = "Explore one room at a time. Your progress is saved as you work.";
      }
    }
    if (shouldSave) emitProgress();
  }

  function markQuestionSolved(node, selectedButton, showRestoredFeedback = false) {
    node.classList.add("is-solved");
    node.querySelectorAll(".inline-choice").forEach((button) => {
      if (button.dataset.choice === node.dataset.correct) {
        button.classList.add("is-correct");
        button.setAttribute("aria-pressed", "true");
      } else {
        button.disabled = true;
        button.setAttribute("aria-pressed", "false");
      }
    });
    const feedback = node.querySelector(".question-feedback");
    feedback.className = "question-feedback is-right";
    feedback.textContent = `${showRestoredFeedback ? "✓ Previously mastered. " : "✓ Correct. "}${node.dataset.explanation}`;
    if (selectedButton) selectedButton.setAttribute("aria-pressed", "true");
  }

  questionNodes.forEach((node) => {
    if (completedQuestions.has(node.dataset.question)) markQuestionSolved(node, null, true);
  });

  target.querySelectorAll(".inline-choice").forEach((button) => {
    button.addEventListener("click", () => {
      const node = button.closest(".gap-question");
      if (!node || node.classList.contains("is-solved")) return;
      node.querySelectorAll(".inline-choice").forEach((choice) => {
        choice.classList.remove("is-incorrect", "is-correct");
        choice.setAttribute("aria-pressed", "false");
      });
      button.setAttribute("aria-pressed", "true");
      const feedback = node.querySelector(".question-feedback");
      if (button.dataset.choice === node.dataset.correct) {
        completedQuestions.add(node.dataset.question);
        markQuestionSolved(node, button);
        feedback.textContent = `✓ Correct. ${node.dataset.explanation}`;
        updateProgress(true);
      } else {
        button.classList.add("is-incorrect");
        feedback.className = "question-feedback is-try-again";
        feedback.textContent = "Not quite yet. Read the whole statement again, find the rule that matters, and try another option. You can retry without losing progress.";
      }
    });
  });

  exampleNodes.forEach((node) => {
    const form = node.querySelector(".example-answer-form");
    const input = node.querySelector("input[name='answer']");
    const feedback = node.querySelector(".example-feedback");
    const hint = node.querySelector(".example-hint");
    const solution = node.querySelector(".teacher-solution");
    let acceptedAnswers;
    try {
      acceptedAnswers = JSON.parse(node.dataset.accepted);
    } catch {
      acceptedAnswers = [];
    }

    function unlockSolution(previouslyCompleted = false) {
      completedExamples.add(node.dataset.example);
      input.disabled = true;
      form.querySelector("button[type='submit']").disabled = true;
      input.classList.add("answer-correct");
      feedback.className = "example-feedback is-right";
      feedback.textContent = previouslyCompleted ? "✓ This example was already solved on your account. The teacher's solution is unlocked below." : "✓ Correct. The teacher's worked example is now unlocked below.";
      hint.hidden = true;
      solution.hidden = false;
      solution.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }

    if (completedExamples.has(node.dataset.example)) {
      unlockSolution(true);
    }

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      if (completedExamples.has(node.dataset.example)) return;
      const raw = input.value.trim();
      if (!raw) {
        feedback.className = "example-feedback is-try-again";
        feedback.textContent = "Enter an answer before checking it.";
        input.focus();
        return;
      }
      const answer = normaliseAnswer(raw);
      const accepted = acceptedAnswers.some((candidate) => normaliseAnswer(candidate) === answer);
      if (accepted) {
        unlockSolution(false);
        updateProgress(true);
      } else {
        feedback.className = "example-feedback is-try-again";
        feedback.textContent = "That answer has not unlocked the solution yet. Re-check the condition and try again.";
        hint.hidden = false;
        hint.textContent = `Hint: ${node.dataset.hint}`;
        input.focus();
        input.select();
      }
    });
  });

  target.querySelector("[data-reset-lesson]")?.addEventListener("click", () => {
    const shouldReset = typeof globalThis.confirm === "function"
      ? globalThis.confirm("Reset all saved progress for this lesson on this account? This cannot be undone.")
      : true;
    if (!shouldReset) return;
    completedQuestions.clear();
    completedExamples.clear();
    questionNodes.forEach((node) => {
      node.classList.remove("is-solved");
      node.querySelectorAll(".inline-choice").forEach((button) => {
        button.classList.remove("is-correct", "is-incorrect");
        button.disabled = false;
        button.setAttribute("aria-pressed", "false");
      });
      const feedback = node.querySelector(".question-feedback");
      if (feedback) {
        feedback.className = "question-feedback";
        feedback.textContent = "";
      }
    });
    exampleNodes.forEach((node) => {
      node.querySelector("input[name='answer']").disabled = false;
      node.querySelector("input[name='answer']").value = "";
      node.querySelector("input[name='answer']").classList.remove("answer-correct");
      node.querySelector("button[type='submit']").disabled = false;
      const feedback = node.querySelector(".example-feedback");
      feedback.className = "example-feedback";
      feedback.textContent = "";
      node.querySelector(".example-hint").hidden = true;
      node.querySelector(".teacher-solution").hidden = true;
    });
    updateProgress(true);
    target.querySelector("#station-briefing")?.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  updateProgress(false);
}
