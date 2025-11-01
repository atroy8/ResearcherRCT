// Game State
const gameState = {
  currentStage: 1,
  nullHypothesisCorrect: false,
  altHypothesisCorrect: false,
  populationScore: 0,
  randomizationComplete: false,
  randomizationQuestionAnswered: false,
  sequenceCorrect: false,
  questionsScore: 0,
  calculationsComplete: 0,
  calculationAnswers: {},
  interpretationAnswers: {},
  calculationScore: 0,
  interpretationScore: 0,
  finalDecision: false
};

// Data
const hypothesesData = {
  null: {
    correct: "There is no difference in endometriosis-related pain scores between the treatment group (oral contraceptives + low-sugar diet) and the control group (placebo).",
    distractors: [
      "The treatment group will have higher pain scores than the control group",
      "All participants will show improvement in symptoms",
      "Oral contraceptives cause endometriosis"
    ]
  },
  alternative: {
    correct: "There is a difference in endometriosis-related pain scores between the treatment group (oral contraceptives + low-sugar diet) and the control group (placebo).",
    distractors: [
      "The treatment group will have lower pain scores than the control group",
      "The low-sugar diet alone is responsible for any differences",
      "Only some participants will show improvement"
    ]
  }
};

const populationCriteria = {
  eligible: [
    "Women aged 18-45 with confirmed endometriosis diagnosis",
    "Moderate to severe endometriosis-related pain (NRS score ≥ 4)",
    "No contraindications to oral contraceptive use",
    "Willing to follow a low-sugar diet for study duration",
    "Able to provide informed consent"
  ],
  ineligible: [
    "Men with pelvic pain",
    "Women who are currently pregnant",
    "Participants with history of blood clots (contraindication to OC)",
    "Participants planning to conceive within study period",
    "Women who cannot follow dietary restrictions"
  ]
};

const blindingSequence = [
  {
    position: 1,
    text: "Prepare identical-appearing pills (active OC and placebo)",
    explanation: "First step ensures treatments look identical"
  },
  {
    position: 2,
    text: "Assign participants to groups using concealed randomization",
    explanation: "Randomization must be concealed to prevent selection bias"
  },
  {
    position: 3,
    text: "Ensure participants do not know which pill they receive",
    explanation: "Participant blinding prevents expectation bias"
  },
  {
    position: 4,
    text: "Ensure healthcare providers administering treatment do not know group assignment",
    explanation: "Provider blinding prevents differential treatment"
  },
  {
    position: 5,
    text: "Ensure outcome assessors evaluating pain scores are blinded to group assignment",
    explanation: "Assessor blinding prevents measurement bias"
  },
  {
    position: 6,
    text: "Maintain blinding throughout entire data collection period",
    explanation: "Continuous blinding protects study integrity"
  },
  {
    position: 7,
    text: "Unblind only after all data is collected and preliminary analysis complete",
    explanation: "Final step ensures no bias in data collection or initial analysis"
  }
];

const dataCollectionQuestions = {
  good: [
    {
      text: "On a scale of 0-10, how would you rate your pelvic pain today?",
      reason: "Uses validated numerical scale, objective measurement"
    },
    {
      text: "How many days of menstrual bleeding did you experience this month?",
      reason: "Quantifiable outcome, no bias"
    },
    {
      text: "Rate your pain during intercourse on a scale of 0-10",
      reason: "Specific symptom with numerical scale"
    },
    {
      text: "How many pain medication doses did you take this week?",
      reason: "Objective measure of pain management needs"
    },
    {
      text: "Rate your overall quality of life using the EQ-5D scale",
      reason: "Standardized, validated quality of life measure"
    }
  ],
  problematic: [
    {
      text: "Do you feel the treatment is working?",
      reason: "Introduces bias - participant beliefs may not reflect actual outcomes"
    },
    {
      text: "Have you felt better since starting the pills? (yes/no)",
      reason: "Loses granularity of data, forced binary response"
    },
    {
      text: "Which treatment do you think you received?",
      reason: "Breaks blinding, introduces expectation bias"
    },
    {
      text: "Did you follow the diet perfectly?",
      reason: "May censor non-compliant data, participants may lie"
    },
    {
      text: "Are you satisfied with the study?",
      reason: "Irrelevant to outcomes, measures satisfaction not symptoms"
    }
  ]
};

const calculations = [
  {
    id: 'riskDiff',
    title: 'Risk Difference (RD)',
    formula: 'RD = Risk(Control) - Risk(Treatment)',
    calculation: '0.65 - 0.30',
    answer: 0.35,
    interpretation: 'Treatment reduces risk by 0.35 (35 percentage points)',
    tfQuestion: 'A positive risk difference means the treatment increases risk compared to control.',
    tfAnswer: false,
    tfExplanation: 'False. A positive risk difference (when calculated as Control - Treatment) means the treatment REDUCES risk compared to control.'
  },
  {
    id: 'riskRatio',
    title: 'Risk Ratio (RR)',
    formula: 'RR = Risk(Treatment) / Risk(Control)',
    calculation: '0.30 / 0.65',
    answer: 0.46,
    interpretation: 'Treatment group has 0.46 times the risk (54% reduction)',
    tfQuestion: 'A risk ratio less than 1 means the treatment reduces risk compared to control.',
    tfAnswer: true,
    tfExplanation: 'True. When RR < 1, the treatment group has lower risk than the control group, indicating a protective effect.'
  },
  {
    id: 'oddsRatio',
    title: 'Odds Ratio (OR)',
    formula: 'OR = (a × d) / (b × c), where a=30, b=70, c=65, d=35',
    calculation: '(30 × 35) / (70 × 65)',
    answer: 0.23,
    interpretation: 'Odds of persistent symptoms in treatment group are 0.23 times the odds in control group',
    tfQuestion: 'An odds ratio of 0.23 indicates that treatment increases the odds of persistent symptoms.',
    tfAnswer: false,
    tfExplanation: 'False. An OR < 1 means the treatment DECREASES the odds of the outcome (persistent symptoms).'
  },
  {
    id: 'ci',
    title: 'Confidence Interval (95% CI for RD)',
    formula: 'CI = Point Estimate ± (1.96 × Standard Error)',
    calculation: 'Example: RD 95% CI = 0.35 ± 0.10 = (0.25, 0.45)',
    answer: null,
    interpretation: 'We are 95% confident the true risk difference is between 0.25 and 0.45',
    readOnly: true
  },
  {
    id: 'efficacy',
    title: 'Efficacy',
    formula: 'Efficacy = [(Risk Control - Risk Treatment) / Risk Control] × 100%',
    calculation: '[(0.65 - 0.30) / 0.65] × 100%',
    answer: 53.8,
    interpretation: 'Treatment reduces persistent symptoms by 53.8%',
    tfQuestion: 'An efficacy of 53.8% means that about half of the risk in the control group is prevented by the treatment.',
    tfAnswer: true,
    tfExplanation: 'True. Efficacy represents the percentage reduction in risk attributable to the treatment. 53.8% means the treatment prevents about 54% of persistent symptoms.'
  },
  {
    id: 'nnt',
    title: 'Number Needed to Treat (NNT)',
    formula: 'NNT = 1 / |Risk Difference|',
    calculation: '1 / 0.35',
    answer: 3,
    interpretation: 'Need to treat 3 patients for 1 additional patient to benefit',
    tfQuestion: 'A lower NNT value indicates a more effective treatment.',
    tfAnswer: true,
    tfExplanation: 'True. A lower NNT means fewer patients need to be treated to achieve one additional positive outcome, indicating greater treatment effectiveness.'
  }
];

// Initialize Game
function initGame() {
  updateProgress();
  initHypothesisStage();
  initPopulationStage();
  initBlindingStage();
  initDataCollectionStage();
  initCalculationsStage();
  initDecisionStage();
}

// Navigation
function nextStage() {
  document.getElementById(`stage${gameState.currentStage}`).classList.add('hidden');
  gameState.currentStage++;
  document.getElementById(`stage${gameState.currentStage}`).classList.remove('hidden');
  updateProgress();
  window.scrollTo(0, 0);
}

function previousStage() {
  document.getElementById(`stage${gameState.currentStage}`).classList.add('hidden');
  gameState.currentStage--;
  document.getElementById(`stage${gameState.currentStage}`).classList.remove('hidden');
  updateProgress();
  window.scrollTo(0, 0);
}

function updateProgress() {
  const progress = (gameState.currentStage / 8) * 100;
  document.getElementById('progressFill').style.width = `${progress}%`;
  document.getElementById('progressText').textContent = `Stage ${gameState.currentStage} of 8`;
}

// Stage 2: Hypothesis Selection
function initHypothesisStage() {
  const nullOptions = [hypothesesData.null.correct, ...hypothesesData.null.distractors];
  const altOptions = [hypothesesData.alternative.correct, ...hypothesesData.alternative.distractors];
  
  shuffleArray(nullOptions);
  shuffleArray(altOptions);
  
  renderOptions('nullOptions', nullOptions, 'null');
  renderOptions('altOptions', altOptions, 'alt');
}

function renderOptions(containerId, options, type) {
  const container = document.getElementById(containerId);
  container.innerHTML = '';
  
  options.forEach((option, index) => {
    const card = document.createElement('div');
    card.className = 'option-card';
    card.textContent = option;
    card.onclick = () => selectHypothesis(type, option, card);
    container.appendChild(card);
  });
}

function selectHypothesis(type, selected, cardElement) {
  const isCorrect = (type === 'null' && selected === hypothesesData.null.correct) ||
                   (type === 'alt' && selected === hypothesesData.alternative.correct);
  
  // Clear previous selections
  const container = cardElement.parentElement;
  container.querySelectorAll('.option-card').forEach(card => {
    card.classList.remove('selected', 'correct', 'incorrect');
  });
  
  if (isCorrect) {
    cardElement.classList.add('correct');
    if (type === 'null') {
      gameState.nullHypothesisCorrect = true;
      showFeedback('nullFeedback', true, 'Correct! This is the proper null hypothesis stating no difference between groups.');
    } else {
      gameState.altHypothesisCorrect = true;
      showFeedback('altFeedback', true, 'Correct! This is the proper alternative hypothesis stating a difference exists.');
    }
  } else {
    cardElement.classList.add('incorrect');
    if (type === 'null') {
      gameState.nullHypothesisCorrect = false;
      showFeedback('nullFeedback', false, 'Incorrect. The null hypothesis should state there is NO difference between groups.');
    } else {
      gameState.altHypothesisCorrect = false;
      showFeedback('altFeedback', false, 'Incorrect. The alternative hypothesis should state there IS a difference, without specifying direction.');
    }
  }
  
  // Enable next button if both correct
  if (gameState.nullHypothesisCorrect && gameState.altHypothesisCorrect) {
    document.getElementById('nextBtn2').disabled = false;
  }
}

function showFeedback(elementId, isSuccess, message) {
  const feedback = document.getElementById(elementId);
  feedback.className = `feedback show ${isSuccess ? 'success' : 'error'}`;
  feedback.textContent = message;
}

// Stage 3: Study Population - Enhanced drag and drop
function initPopulationStage() {
  const pool = document.getElementById('criteriaPool');
  const allCriteria = [...populationCriteria.eligible, ...populationCriteria.ineligible];
  shuffleArray(allCriteria);
  
  allCriteria.forEach(criterion => {
    const card = createCriteriaCard(criterion);
    pool.appendChild(card);
  });
  
  // Setup drag-and-drop
  setupDragAndDrop();
}

function setupDragAndDrop() {
  const dropZones = document.querySelectorAll('.drop-zone, .criteria-pool');
  
  dropZones.forEach(zone => {
    zone.addEventListener('dragover', (e) => {
      e.preventDefault();
      zone.classList.add('drag-over');
    });
    
    zone.addEventListener('dragleave', () => {
      zone.classList.remove('drag-over');
    });
    
    zone.addEventListener('drop', (e) => {
      e.preventDefault();
      zone.classList.remove('drag-over');
      
      const cardId = e.dataTransfer.getData('text/plain');
      const card = document.querySelector(`[data-card-id="${cardId}"]`);
      
      if (card && zone.classList.contains('drop-zone')) {
        handleCardDrop(card, zone);
      }
    });
  });
}

function createCriteriaCard(text) {
  const card = document.createElement('div');
  card.className = 'criteria-card';
  card.textContent = text;
  card.dataset.text = text;
  card.dataset.cardId = 'card-' + Math.random().toString(36).substr(2, 9);
  card.draggable = true;
  
  card.addEventListener('dragstart', (e) => {
    e.dataTransfer.setData('text/plain', card.dataset.cardId);
    card.style.opacity = '0.5';
  });
  
  card.addEventListener('dragend', () => {
    card.style.opacity = '1';
  });
  
  card.onclick = () => selectCriteria(card);
  return card;
}

function handleCardDrop(card, zone) {
  const text = card.dataset.text;
  const isEligible = populationCriteria.eligible.includes(text);
  const zoneType = zone.id === 'eligibleZone' ? 'eligible' : 'ineligible';
  const isCorrect = (zoneType === 'eligible' && isEligible) || (zoneType === 'ineligible' && !isEligible);
  
  if (isCorrect) {
    zone.appendChild(card);
    card.classList.add('correct-placement');
    card.classList.remove('selected');
    card.draggable = false;
    card.onclick = null;
    if (!gameState.calculationAnswers[card.dataset.cardId]) {
      gameState.calculationAnswers[card.dataset.cardId] = true;
      gameState.populationScore++;
    }
  } else {
    card.classList.add('incorrect-placement');
    setTimeout(() => {
      document.getElementById('criteriaPool').appendChild(card);
      card.classList.remove('incorrect-placement', 'selected');
    }, 800);
  }
  
  updatePopulationScore();
}

let selectedCriteriaCard = null;

function selectCriteria(card) {
  if (card.classList.contains('correct-placement')) return;
  
  if (selectedCriteriaCard) {
    selectedCriteriaCard.classList.remove('selected');
  }
  selectedCriteriaCard = card;
  card.classList.add('selected');
}

document.getElementById('eligibleZone').onclick = (e) => {
  if (e.target.classList.contains('drop-zone')) {
    placeCriteria('eligible');
  }
};
document.getElementById('ineligibleZone').onclick = (e) => {
  if (e.target.classList.contains('drop-zone')) {
    placeCriteria('ineligible');
  }
};

function placeCriteria(zone) {
  if (!selectedCriteriaCard) return;
  
  const text = selectedCriteriaCard.dataset.text;
  const isEligible = populationCriteria.eligible.includes(text);
  const isCorrect = (zone === 'eligible' && isEligible) || (zone === 'ineligible' && !isEligible);
  
  const targetZone = document.getElementById(`${zone}Zone`);
  
  if (isCorrect) {
    targetZone.appendChild(selectedCriteriaCard);
    selectedCriteriaCard.classList.add('correct-placement');
    selectedCriteriaCard.classList.remove('selected');
    selectedCriteriaCard.draggable = false;
    selectedCriteriaCard.onclick = null;
    if (!gameState.calculationAnswers[selectedCriteriaCard.dataset.cardId]) {
      gameState.calculationAnswers[selectedCriteriaCard.dataset.cardId] = true;
      gameState.populationScore++;
    }
  } else {
    selectedCriteriaCard.classList.add('incorrect-placement');
    const tempCard = selectedCriteriaCard;
    setTimeout(() => {
      document.getElementById('criteriaPool').appendChild(tempCard);
      tempCard.classList.remove('incorrect-placement', 'selected');
    }, 800);
  }
  
  selectedCriteriaCard = null;
  updatePopulationScore();
}

function updatePopulationScore() {
  document.getElementById('populationScore').textContent = `Correct: ${gameState.populationScore}/10`;
  
  if (gameState.populationScore === 10) {
    document.getElementById('nextBtn3').disabled = false;
    document.getElementById('criteriaPool').classList.add('empty');
  }
}

// Stage 4: Randomization
function randomizeParticipants() {
  const viz = document.getElementById('randomizationViz');
  viz.innerHTML = '';
  
  // Create 200 participant dots
  for (let i = 0; i < 200; i++) {
    const dot = document.createElement('div');
    dot.className = 'participant-dot';
    viz.appendChild(dot);
  }
  
  // Animate randomization
  const dots = viz.querySelectorAll('.participant-dot');
  let count = 0;
  const interval = setInterval(() => {
    if (count >= 200) {
      clearInterval(interval);
      gameState.randomizationComplete = true;
      document.getElementById('randomizeBtn').disabled = true;
      
      // Show randomization question after animation
      setTimeout(() => {
        showRandomizationQuestion();
      }, 500);
      return;
    }
    
    const group = Math.random() < 0.5 ? 'treatment' : 'control';
    dots[count].classList.add(group);
    count++;
    
    // Update counts
    const treatmentCount = Array.from(dots).filter(d => d.classList.contains('treatment')).length;
    const controlCount = Array.from(dots).filter(d => d.classList.contains('control')).length;
    document.getElementById('treatmentCount').textContent = `${treatmentCount} participants`;
    document.getElementById('controlCount').textContent = `${controlCount} participants`;
  }, 20);
}

function showRandomizationQuestion() {
  document.getElementById('randomizationModal').classList.remove('hidden');
}

function answerRandomizationQuestion(optionIndex) {
  const correctIndex = 0; // First option is correct
  const options = document.querySelectorAll('.modal-option');
  const feedback = document.getElementById('randomizationFeedback');
  
  if (optionIndex === correctIndex) {
    options[optionIndex].classList.add('correct');
    feedback.className = 'feedback show success';
    feedback.textContent = '✓ Correct! Randomization eliminates selection bias and ensures that treatment and control groups are comparable at baseline.';
    gameState.randomizationQuestionAnswered = true;
    
    // Disable all options
    options.forEach(opt => opt.style.pointerEvents = 'none');
    
    // Enable next button and close modal after delay
    setTimeout(() => {
      document.getElementById('randomizationModal').classList.add('hidden');
      document.getElementById('nextBtn4').disabled = false;
    }, 2500);
  } else {
    options[optionIndex].classList.add('incorrect');
    feedback.className = 'feedback show error';
    feedback.textContent = '✗ Incorrect. Think about why researchers use random assignment in clinical trials.';
    
    setTimeout(() => {
      options[optionIndex].classList.remove('incorrect');
      feedback.className = 'feedback';
    }, 2000);
  }
}

// Stage 5: Blinding Sequence - Drag and Drop
let draggedCard = null;
let blindingSlots = [];

function initBlindingStage() {
  const sourceArea = document.getElementById('blindingSource');
  const targetArea = document.getElementById('blindingTarget');
  
  // Clear any previous content
  sourceArea.innerHTML = '';
  targetArea.innerHTML = '';
  blindingSlots = [];
  
  // Create shuffled cards in source area
  const shuffled = [...blindingSequence];
  shuffleArray(shuffled);
  
  shuffled.forEach(step => {
    const card = createBlindingCard(step);
    sourceArea.appendChild(card);
  });
  
  // Create 7 numbered slots in target area
  for (let i = 1; i <= 7; i++) {
    const slot = createBlindingSlot(i);
    targetArea.appendChild(slot);
    blindingSlots.push(slot);
  }
  
  // Enable drag-and-drop on source area
  setupSourceAreaDrop();
  
  // Update progress counter
  updateBlindingProgress();
  
  // Check button is always enabled
  document.getElementById('checkSequenceBtn').disabled = false;
}

function createBlindingCard(step) {
  const card = document.createElement('div');
  card.className = 'blinding-card';
  card.draggable = true;
  card.dataset.position = step.position;
  card.dataset.explanation = step.explanation;
  card.innerHTML = `<div class="card-text">${step.text}</div>`;
  
  // Drag events
  card.addEventListener('dragstart', (e) => {
    draggedCard = card;
    card.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
  });
  
  card.addEventListener('dragend', () => {
    card.classList.remove('dragging');
    draggedCard = null;
  });
  
  return card;
}

function createBlindingSlot(position) {
  const slot = document.createElement('div');
  slot.className = 'blinding-slot';
  slot.dataset.position = position;
  slot.innerHTML = `
    <div class="slot-number">${position}</div>
    <div class="slot-placeholder">Drop Step ${position} Here</div>
  `;
  
  // Drag events for slots
  slot.addEventListener('dragover', (e) => {
    e.preventDefault();
    slot.classList.add('drag-over');
  });
  
  slot.addEventListener('dragleave', () => {
    slot.classList.remove('drag-over');
  });
  
  slot.addEventListener('drop', (e) => {
    e.preventDefault();
    slot.classList.remove('drag-over');
    
    if (!draggedCard) return;
    
    const isFilled = slot.classList.contains('filled');
    const existingCard = slot.querySelector('.blinding-card');
    
    if (isFilled && existingCard) {
      // SWAP: Replace existing card with dragged card
      const draggedParent = draggedCard.parentElement;
      
      // If dragged card is from another slot, swap positions
      if (draggedParent && draggedParent.classList.contains('blinding-slot')) {
        // Swap the two cards
        const tempCard = existingCard;
        slot.removeChild(existingCard);
        slot.appendChild(draggedCard);
        draggedCard.classList.add('in-slot');
        draggedCard.classList.remove('dragging');
        
        draggedParent.appendChild(tempCard);
        tempCard.classList.add('in-slot');
      } else {
        // Dragged from source: move existing card back to source
        const sourceArea = document.getElementById('blindingSource');
        existingCard.classList.remove('in-slot');
        sourceArea.appendChild(existingCard);
        sourceArea.classList.remove('empty');
        
        // Place dragged card in slot
        slot.removeChild(slot.querySelector('.blinding-card'));
        draggedCard.remove();
        const newCard = createBlindingCard({
          position: draggedCard.dataset.position,
          text: draggedCard.querySelector('.card-text').textContent,
          explanation: draggedCard.dataset.explanation
        });
        newCard.classList.add('in-slot');
        slot.appendChild(newCard);
      }
    } else {
      // Empty slot: just place the card
      const placeholder = slot.querySelector('.slot-placeholder');
      if (placeholder) {
        placeholder.remove();
      }
      
      const draggedParent = draggedCard.parentElement;
      if (draggedParent && draggedParent.classList.contains('blinding-slot')) {
        // Moving from another slot - restore placeholder in old slot
        draggedParent.classList.remove('filled');
        const oldPos = draggedParent.dataset.position;
        draggedParent.innerHTML = `
          <div class="slot-number">${oldPos}</div>
          <div class="slot-placeholder">Drop Step ${oldPos} Here</div>
        `;
      }
      
      // Add card to new slot
      draggedCard.classList.add('in-slot');
      draggedCard.classList.remove('dragging');
      if (draggedCard.parentElement) {
        draggedCard.remove();
      }
      slot.appendChild(draggedCard);
      slot.classList.add('filled');
    }
    
    // Update source area state
    const sourceArea = document.getElementById('blindingSource');
    if (sourceArea.children.length === 0) {
      sourceArea.classList.add('empty');
    } else {
      sourceArea.classList.remove('empty');
    }
    
    // Update progress
    updateBlindingProgress();
    
    // Clear any previous feedback when rearranging
    clearBlindingFeedback();
  });
  
  return slot;
}

function setupSourceAreaDrop() {
  const sourceArea = document.getElementById('blindingSource');
  
  sourceArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    sourceArea.classList.add('drag-over');
  });
  
  sourceArea.addEventListener('dragleave', () => {
    sourceArea.classList.remove('drag-over');
  });
  
  sourceArea.addEventListener('drop', (e) => {
    e.preventDefault();
    sourceArea.classList.remove('drag-over');
    
    if (!draggedCard) return;
    
    const draggedParent = draggedCard.parentElement;
    
    // If dragged from a slot, restore the slot
    if (draggedParent && draggedParent.classList.contains('blinding-slot')) {
      draggedParent.classList.remove('filled');
      const pos = draggedParent.dataset.position;
      draggedParent.innerHTML = `
        <div class="slot-number">${pos}</div>
        <div class="slot-placeholder">Drop Step ${pos} Here</div>
      `;
      
      // Clear feedback classes
      draggedParent.classList.remove('correct-placement', 'incorrect-placement');
    }
    
    // Move card to source area
    draggedCard.classList.remove('in-slot');
    draggedCard.remove();
    const newCard = createBlindingCard({
      position: draggedCard.dataset.position,
      text: draggedCard.querySelector('.card-text').textContent,
      explanation: draggedCard.dataset.explanation
    });
    sourceArea.appendChild(newCard);
    sourceArea.classList.remove('empty');
    
    // Update progress
    updateBlindingProgress();
    
    // Clear feedback
    clearBlindingFeedback();
  });
}

function updateBlindingProgress() {
  const filledCount = blindingSlots.filter(slot => slot.classList.contains('filled')).length;
  
  // Update or create progress counter
  let progressEl = document.querySelector('.blinding-progress');
  if (!progressEl) {
    progressEl = document.createElement('div');
    progressEl.className = 'blinding-progress';
    const targetSection = document.querySelector('.blinding-target-section h3');
    targetSection.insertAdjacentElement('afterend', progressEl);
  }
  progressEl.textContent = `${filledCount} of 7 steps placed`;
}

function clearBlindingFeedback() {
  // Remove feedback classes from slots
  blindingSlots.forEach(slot => {
    slot.classList.remove('correct-placement', 'incorrect-placement');
  });
  
  // Clear feedback message
  const feedback = document.getElementById('sequenceFeedback');
  feedback.className = 'feedback';
  feedback.innerHTML = '';
}

function checkBlindingSequence() {
  // Check if all slots are filled
  const filledCount = blindingSlots.filter(slot => slot.classList.contains('filled')).length;
  
  if (filledCount < 7) {
    const feedback = document.getElementById('sequenceFeedback');
    feedback.className = 'feedback show error';
    feedback.innerHTML = `<strong>⚠ Incomplete Sequence</strong> Please place all 7 steps before checking. You currently have ${filledCount} of 7 steps placed.`;
    return;
  }
  
  let allCorrect = true;
  let correctCount = 0;
  
  blindingSlots.forEach(slot => {
    const card = slot.querySelector('.blinding-card');
    if (card) {
      const cardPosition = parseInt(card.dataset.position);
      const slotPosition = parseInt(slot.dataset.position);
      
      // Remove previous feedback classes
      slot.classList.remove('correct-placement', 'incorrect-placement');
      
      if (cardPosition === slotPosition) {
        slot.classList.add('correct-placement');
        correctCount++;
      } else {
        slot.classList.add('incorrect-placement');
        allCorrect = false;
      }
    }
  });
  
  const feedback = document.getElementById('sequenceFeedback');
  
  if (allCorrect) {
    feedback.className = 'feedback show success';
    feedback.innerHTML = `<strong>✓ Perfect!</strong> This is the correct chronological sequence for establishing proper double-blind procedures. Each step builds upon the previous one to create a robust study design.`;
    gameState.sequenceCorrect = true;
    document.getElementById('nextBtn5').disabled = false;
  } else {
    feedback.className = 'feedback show error';
    feedback.innerHTML = `<strong>✗ Not quite right.</strong> You have ${correctCount} out of 7 steps in the correct position. You can drag cards to different positions to rearrange them, or drag them back to the source area. Try again!`;
  }
}

function resetBlindingSequence() {
  // Reset game state
  gameState.sequenceCorrect = false;
  document.getElementById('nextBtn5').disabled = true;
  
  // Clear feedback
  const feedback = document.getElementById('sequenceFeedback');
  feedback.className = 'feedback';
  feedback.innerHTML = '';
  
  // Reinitialize the stage
  initBlindingStage();
}

// Stage 6: Data Collection
function initDataCollectionStage() {
  const container = document.getElementById('questionsContainer');
  const allQuestions = [
    ...dataCollectionQuestions.good.map(q => ({...q, isGood: true})),
    ...dataCollectionQuestions.problematic.map(q => ({...q, isGood: false}))
  ];
  shuffleArray(allQuestions);
  
  allQuestions.forEach((q, index) => {
    const card = document.createElement('div');
    card.className = 'question-card';
    card.innerHTML = `
      <div class="question-text">${q.text}</div>
      <div class="question-buttons">
        <button class="btn btn--primary" onclick="answerQuestion(${index}, true)">Good Question</button>
        <button class="btn btn--secondary" onclick="answerQuestion(${index}, false)">Problematic Question</button>
      </div>
      <div class="feedback" id="qFeedback${index}"></div>
    `;
    container.appendChild(card);
    card.dataset.isGood = q.isGood;
    card.dataset.reason = q.reason;
  });
}

function answerQuestion(index, userSaysGood) {
  const cards = document.querySelectorAll('.question-card');
  const card = cards[index];
  const isGood = card.dataset.isGood === 'true';
  const reason = card.dataset.reason;
  
  const isCorrect = userSaysGood === isGood;
  const feedback = document.getElementById(`qFeedback${index}`);
  
  if (isCorrect) {
    feedback.className = 'feedback show success';
    feedback.textContent = `✓ Correct! ${reason}`;
    card.classList.add('answered');
    gameState.questionsScore++;
    card.querySelector('.question-buttons').style.display = 'none';
  } else {
    feedback.className = 'feedback show error';
    feedback.textContent = `✗ Incorrect. ${reason}`;
  }
  
  updateQuestionScore();
}

function updateQuestionScore() {
  document.getElementById('questionScore').textContent = `Correct: ${gameState.questionsScore}/10`;
  
  if (gameState.questionsScore === 10) {
    document.getElementById('nextBtn6').disabled = false;
  }
}

// Stage 7: Statistical Calculations - Show formulas only, then reveal
function initCalculationsStage() {
  const container = document.getElementById('calculationsContainer');
  
  // Add risk calculations first
  const riskCard = document.createElement('div');
  riskCard.className = 'calculation-card';
  riskCard.innerHTML = `
    <h4>Step 1: Calculate Risks</h4>
    <div class="formula">Risk in Treatment = 30/100 = 0.30</div>
    <div class="formula">Risk in Control = 65/100 = 0.65</div>
    <p style="margin-top: 12px;">These values will be used in the calculations below.</p>
  `;
  container.appendChild(riskCard);
  
  calculations.forEach((calc, index) => {
    const card = document.createElement('div');
    card.className = 'calculation-card';
    card.id = `calcCard${calc.id}`;
    
    if (calc.readOnly) {
      card.innerHTML = `
        <h4>${calc.title}</h4>
        <div class="formula"><strong>Formula:</strong> ${calc.formula}</div>
        <div class="formula"><strong>Example:</strong> ${calc.calculation}</div>
        <div class="interpretation">${calc.interpretation}</div>
      `;
    } else {
      card.innerHTML = `
        <h4>${calc.title}</h4>
        <div class="formula"><strong>Formula:</strong> ${calc.formula}</div>
        <div class="calculation-input">
          <label>Your answer:</label>
          <input type="number" step="0.01" id="input${calc.id}" placeholder="Enter your answer">
          <button class="btn btn--primary" onclick="checkCalculation('${calc.id}', ${calc.answer}, ${index})">Check</button>
        </div>
        <div id="result${calc.id}" style="display:none;">
          <div class="formula"><strong>Correct Answer:</strong> ${calc.calculation} = ${calc.answer}</div>
          <div class="interpretation">${calc.interpretation}</div>
        </div>
      `;
    }
    
    container.appendChild(card);
  });
}

function checkCalculation(id, correctAnswer, index) {
  const input = document.getElementById(`input${id}`);
  const userAnswer = parseFloat(input.value);
  const resultDiv = document.getElementById(`result${id}`);
  const calcData = calculations[index];
  
  const isCorrect = Math.abs(userAnswer - correctAnswer) < 0.05;
  
  // Always reveal the answer after checking
  resultDiv.style.display = 'block';
  input.disabled = true;
  
  if (isCorrect) {
    input.style.borderColor = 'var(--color-success)';
    if (!gameState.calculationAnswers[id]) {
      gameState.calculationAnswers[id] = true;
      gameState.calculationScore++;
    }
  } else {
    input.style.borderColor = 'var(--color-error)';
    if (!gameState.calculationAnswers[id]) {
      gameState.calculationAnswers[id] = false;
    }
  }
  
  // Show interpretation question if not already answered
  if (!gameState.interpretationAnswers[id] && calcData.tfQuestion) {
    setTimeout(() => {
      showInterpretationQuestion(id, calcData);
    }, 500);
  } else {
    checkAllCalculationsComplete();
  }
}

function showInterpretationQuestion(id, calcData) {
  const card = document.getElementById(`calcCard${id}`);
  const tfDiv = document.createElement('div');
  tfDiv.className = 'interpretation-question';
  tfDiv.id = `tf${id}`;
  tfDiv.innerHTML = `
    <p><strong>Interpretation Question:</strong> ${calcData.tfQuestion}</p>
    <div class="tf-buttons">
      <button class="btn btn--primary" onclick="answerInterpretation('${id}', true, ${calcData.tfAnswer})">True</button>
      <button class="btn btn--secondary" onclick="answerInterpretation('${id}', false, ${calcData.tfAnswer})">False</button>
    </div>
    <div class="feedback" id="tfFeedback${id}"></div>
  `;
  card.appendChild(tfDiv);
}

function answerInterpretation(id, userAnswer, correctAnswer) {
  const isCorrect = userAnswer === correctAnswer;
  const feedback = document.getElementById(`tfFeedback${id}`);
  const calcData = calculations.find(c => c.id === id);
  const buttons = document.querySelectorAll(`#tf${id} .btn`);
  
  buttons.forEach(btn => btn.disabled = true);
  
  if (isCorrect) {
    feedback.className = 'feedback show success';
    feedback.textContent = `✓ Correct! ${calcData.tfExplanation}`;
    gameState.interpretationScore++;
  } else {
    feedback.className = 'feedback show error';
    feedback.textContent = `✗ Incorrect. ${calcData.tfExplanation}`;
  }
  
  gameState.interpretationAnswers[id] = isCorrect;
  checkAllCalculationsComplete();
}

function checkAllCalculationsComplete() {
  // Count non-readonly calculations
  const totalCalcs = calculations.filter(c => !c.readOnly).length;
  const answeredCalcs = Object.keys(gameState.calculationAnswers).length;
  const answeredInterps = Object.keys(gameState.interpretationAnswers).length;
  
  if (answeredCalcs === totalCalcs && answeredInterps === totalCalcs) {
    document.getElementById('nextBtn7').disabled = false;
  }
}

// Stage 8: Hypothesis Decision
function initDecisionStage() {
  const container = document.getElementById('decisionOptions');
  
  const options = [
    {
      text: "Reject the null hypothesis - there IS a statistically significant difference between groups",
      correct: true
    },
    {
      text: "Fail to reject the null hypothesis - there is NO statistically significant difference",
      correct: false
    }
  ];
  
  options.forEach(option => {
    const card = document.createElement('div');
    card.className = 'decision-card';
    card.textContent = option.text;
    card.onclick = () => makeDecision(option.correct, card);
    container.appendChild(card);
  });
}

function makeDecision(isCorrect, cardElement) {
  const cards = document.querySelectorAll('.decision-card');
  cards.forEach(c => c.style.pointerEvents = 'none');
  
  if (isCorrect) {
    cardElement.classList.add('correct');
    showFeedback('decisionFeedback', true, 'Correct! Since p = 0.001 < 0.05, we reject the null hypothesis. There is strong evidence of a statistically significant difference.');
    gameState.finalDecision = true;
    
    setTimeout(() => {
      showStudySummary();
    }, 1500);
  } else {
    cardElement.classList.add('incorrect');
    showFeedback('decisionFeedback', false, 'Incorrect. When p-value < α (0.001 < 0.05), we reject the null hypothesis.');
    setTimeout(() => {
      cards.forEach(c => {
        c.style.pointerEvents = 'auto';
        c.classList.remove('incorrect');
      });
    }, 2000);
  }
}

function showStudySummary() {
  const summary = document.getElementById('studySummary');
  summary.classList.remove('hidden');
  
  const totalCalcs = calculations.filter(c => !c.readOnly).length;
  const calcAccuracy = ((gameState.calculationScore / totalCalcs) * 100).toFixed(0);
  const interpAccuracy = ((gameState.interpretationScore / totalCalcs) * 100).toFixed(0);
  
  const findings = document.getElementById('summaryFindings');
  findings.innerHTML = `
    <li>Risk Difference: 0.35 (35 percentage points)</li>
    <li>Risk Ratio: 0.46 (54% risk reduction)</li>
    <li>Odds Ratio: 0.23</li>
    <li>Efficacy: 53.8%</li>
    <li>Number Needed to Treat: 3 patients</li>
    <li>P-value: 0.001 (highly significant)</li>
    <li style="margin-top: 16px; color: var(--color-primary); font-weight: var(--font-weight-semibold);">Your Performance:</li>
    <li>Calculation Accuracy: ${gameState.calculationScore}/${totalCalcs} (${calcAccuracy}%)</li>
    <li>Interpretation Accuracy: ${gameState.interpretationScore}/${totalCalcs} (${interpAccuracy}%)</li>
  `;
}

function restartGame() {
  location.reload();
}

// Utility Functions
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// Initialize game on load
window.onload = initGame;