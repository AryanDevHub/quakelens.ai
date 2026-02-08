import type { OfflineProtocol } from '@/types';

export const offlineProtocols: OfflineProtocol[] = [
  {
    category: 'trauma',
    title: '🚨 HEMORRHAGE & BLEEDING PROTOCOL',
    content: `1. APPLY firm direct pressure with clean cloth or gauze
2. ELEVATE the injured limb above heart level if possible
3. SECURE with tight bandage or tourniquet if severe
4. Do NOT remove pressure if object is embedded
5. Monitor for signs of shock (pale skin, rapid pulse)`,
    keywords: ['bleed', 'cut', 'wound', 'blood', 'hemorrhage', 'anemia', 'clot', 'crush', 'stuck', 'trapped', 'entrapped']
  },
  {
    category: 'ortho',
    title: '🩹 BONE / SPINE / FRACTURE PROTOCOL',
    content: `1. IMMOBILIZE the affected area immediately
2. Do NOT attempt to realign or straighten the bone
3. SPLINT using rigid material (wood, cardboard, rolled newspaper)
4. Cover open fractures with clean cloth to prevent infection
5. For SPINE injuries: Do NOT move victim. Support head with padding`,
    keywords: ['bone', 'fracture', 'break', 'neck', 'spine', 'move', 'fall', 'joint', 'sprain', 'dislocation', 'arm', 'leg']
  },
  {
    category: 'internal',
    title: '🚑 INTERNAL ORGAN TRAUMA PROTOCOL',
    content: `1. Lay victim flat and keep them perfectly still
2. Do NOT give food or water (may need surgery)
3. Watch for signs: Rigid abdomen, severe side pain, reduced urination
4. Treat for shock: Raise legs 12 inches, keep warm with blankets
5. Monitor breathing and consciousness closely`,
    keywords: ['stomach', 'liver', 'kidney', 'spleen', 'internal', 'organ', 'rupture', 'abdominal', 'urine', 'chest', 'abdomen']
  },
  {
    category: 'respiratory',
    title: '🫁 RESPIRATORY / CARDIAC PROTOCOL',
    content: `1. Position victim sitting upright to ease breathing
2. Loosen tight clothing around neck and chest
3. Clear airway: Remove visible debris, tilt head back slightly
4. Use wet cloth as mask if dust/smoke present
5. Begin CPR if no pulse detected: 30 compressions, 2 breaths`,
    keywords: ['breath', 'lung', 'choke', 'asthma', 'smoke', 'chest', 'cough', 'airway', 'edema', 'aspiration', 'heart', 'cardiac', 'pulse']
  },
  {
    category: 'environmental',
    title: '🧪 BURNS & TOXIC EXPOSURE PROTOCOL',
    content: `1. THERMAL BURNS: Cool with running water for 10+ minutes
2. Do NOT apply oil, butter, or ice to burns
3. CHEMICAL BURNS: Flush with water for 15+ minutes
4. Remove contaminated clothing carefully
5. GAS/FUEL exposure: Move to fresh air immediately`,
    keywords: ['burn', 'fire', 'chemical', 'acid', 'heat', 'cold', 'sunburn', 'hypothermia', 'poison', 'gas', 'fuel', 'toxin', 'pesticide']
  },
  {
    category: 'maternal',
    title: '🤱 MATERNAL / CHILD CARE PROTOCOL',
    content: `1. PREGNANCY: Lay on LEFT side to maintain blood flow to fetus
2. LABOR: Support baby as it emerges; do NOT pull
3. Keep newborn skin-to-skin for warmth and bonding
4. CHILDREN: Watch for dehydration - give small sips of ORS
5. Keep child calm and reassured throughout`,
    keywords: ['pregnant', 'labor', 'birth', 'baby', 'breast', 'child', 'infant', 'kid', 'malnutrition', 'newborn']
  },
  {
    category: 'neuro',
    title: '🧠 HEAD / NEUROLOGICAL PROTOCOL',
    content: `1. Do NOT move victim if head/neck injury suspected
2. Monitor consciousness level (AVPU: Alert, Voice, Pain, Unresponsive)
3. Watch for vomiting - turn head to side to prevent choking
4. Apply cold compress to swelling (not directly on skin)
5. Note any seizures - protect from injury, do NOT restrain`,
    keywords: ['seizure', 'brain', 'head', 'concussion', 'dizzy', 'unconscious', 'faint', 'stroke', 'paralysis', 'numb']
  },
  {
    category: 'psych',
    title: '🧘 PSYCHOSOCIAL STABILIZATION PROTOCOL',
    content: `1. GROUNDING TECHNIQUE: Name 5 things you see, 4 you feel, 3 you hear
2. PANIC ATTACK: 4-4-4-4 Box Breathing (inhale, hold, exhale, hold)
3. Speak in low, calm, reassuring voice
4. Reduce stimulation: dim lights, minimize noise
5. Stay with person - do NOT leave them alone`,
    keywords: ['panic', 'scared', 'ptsd', 'stress', 'psychosis', 'flashback', 'anxiety', 'depression', 'shock', 'mental']
  },
  {
    category: 'infection',
    title: '💧 INFECTION & SANITATION PROTOCOL',
    content: `1. ORS SOLUTION: 6 tsp sugar + 0.5 tsp salt per 1L clean water
2. Clean wounds daily with clean water and mild soap
3. Keep wounds dry and covered with clean bandages
4. Isolate diarrhea cases to prevent spread
5. Wash hands thoroughly after any patient contact`,
    keywords: ['water', 'diarrhea', 'vomit', 'sepsis', 'infection', 'fever', 'disease', 'virus', 'bacteria', 'wound', 'clean']
  },
  {
    category: 'general',
    title: '💾 GENERAL EMERGENCY PROTOCOL',
    content: `1. Ensure scene safety before approaching victim
2. Check responsiveness and breathing
3. Call for help if others are available
4. Lay victim flat, keep warm with blankets or clothing
5. Clear airways and control any bleeding
6. Stay with victim until professional help arrives`,
    keywords: ['help', 'emergency', 'aid', 'first', 'general', 'basic', 'what', 'how', 'do', 'save', 'rescue']
  }
];

export const getOfflineProtocol = (input: string): OfflineProtocol => {
  const lowerInput = input.toLowerCase();
  
  for (const protocol of offlineProtocols) {
    if (protocol.keywords.some(keyword => lowerInput.includes(keyword))) {
      return protocol;
    }
  }
  
  return offlineProtocols.find(p => p.category === 'general')!;
};
