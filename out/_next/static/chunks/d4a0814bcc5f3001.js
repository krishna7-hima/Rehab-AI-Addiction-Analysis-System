(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,21922,e=>{"use strict";var t=e.i(5928);e.i(34005);var a=e.i(55372),i=e.i(27790),s=["a","button","div","form","h2","h3","img","input","label","li","nav","ol","p","select","span","svg","ul"].reduce((e,s)=>{let r=(0,a.createSlot)(`Primitive.${s}`),o=t.forwardRef((e,t)=>{let{asChild:a,...o}=e;return"u">typeof window&&(window[Symbol.for("radix-ui")]=!0),(0,i.jsx)(a?r:s,{...o,ref:t})});return o.displayName=`Primitive.${s}`,{...e,[s]:o}},{});e.s(["Primitive",()=>s])},90068,e=>{"use strict";var t=e.i(27790),a=e.i(5928),i=e.i(21922),s="horizontal",r=["horizontal","vertical"],o=a.forwardRef((e,a)=>{var o;let{decorative:n,orientation:l=s,...d}=e,c=(o=l,r.includes(o))?l:s;return(0,t.jsx)(i.Primitive.div,{"data-orientation":c,...n?{role:"none"}:{"aria-orientation":"vertical"===c?c:void 0,role:"separator"},...d,ref:a})});o.displayName="Separator";var n=e.i(35093);function l({className:e,orientation:a="horizontal",decorative:i=!0,...s}){return(0,t.jsx)(o,{"data-slot":"separator",decorative:i,orientation:a,className:(0,n.cn)("bg-border shrink-0 data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-px",e),...s})}e.s(["Separator",()=>l],90068)},24993,e=>{"use strict";let t=(0,e.i(64064).default)("arrow-right",[["path",{d:"M5 12h14",key:"1ays0h"}],["path",{d:"m12 5 7 7-7 7",key:"xquz4c"}]]);e.s(["ArrowRight",()=>t],24993)},66840,e=>{"use strict";function t(e){return e<=25?"Low":e<=50?"Moderate":e<=75?"High":"Critical"}let a={alcohol:{liver:.8,lungs:.2,heart:.5,brain:.6},smoking:{liver:.2,lungs:.9,heart:.6,brain:.4},drugs:{liver:.5,lungs:.4,heart:.7,brain:.9},food:{liver:.4,lungs:.1,heart:.7,brain:.3}};function i(e,t){let i=a[e]||a.alcohol,s=t/100;return{liver:Math.round(i.liver*s*100),lungs:Math.round(i.lungs*s*100),heart:Math.round(i.heart*s*100),brain:Math.round(i.brain*s*100)}}let s={alcohol:{stroke:.6,cancer:.5,heartDisease:.7,diabetes:.4},smoking:{stroke:.7,cancer:.9,heartDisease:.8,diabetes:.3},drugs:{stroke:.8,cancer:.4,heartDisease:.6,diabetes:.3},food:{stroke:.5,cancer:.3,heartDisease:.8,diabetes:.9}};function r(e,t,a){let i=s[e]||s.alcohol,r=t/100,o=Math.min(a/20,1),n=e=>Math.round(100*(1/(1+Math.exp(-(-2+4*e*r+2*o)))))/100;return{stroke:n(i.stroke),cancer:n(i.cancer),heartDisease:n(i.heartDisease),diabetes:n(i.diabetes)}}function o(e,t,a){return Math.round(Math.min(.3*e+(t>40?(t-40)*.2:0)+.5*a+4,104))}function n(e){var a;let s,n,l,d,c,m=(s=100*Math.min(e.frequencyPerWeek/7,1),n=100*Math.min(e.durationYears/20,1),l=e.quantityLevel/5*100,d=100*!!e.withdrawalSymptoms,c=e.mentalStressLevel/5*100,Math.round(Math.min(Math.max(.12*s+.08*n+.1*l+.08*d+.1*c+100*((a=e.sleepHours)>=7&&a<=9?0:a>=5&&a<7?.4:a>9&&a<=11?.3:.8)*.07,0),100))),u=t(m),h=i(e.addictionType,m),g=r(e.addictionType,m,e.durationYears),p=o(m,e.age,e.durationYears);return{id:crypto.randomUUID(),date:new Date().toISOString(),input:e,severityScore:m,severityLevel:u,organRisk:h,diseaseRisk:g,recoveryWeeks:p}}function l(e){let t=50;return e.consumed?t-=20:t+=25,e.sleepHours>=7&&e.sleepHours<=9?t+=10:(e.sleepHours<5||e.sleepHours>11)&&(t-=10),e.exerciseMinutes>=30?t+=10:e.exerciseMinutes>=15&&(t+=5),Math.min(Math.max(Math.round(t+=(e.moodScore-3)*5),0),100)}function d(e){if(e.length<2)return 0;let t=[...e].sort((e,t)=>new Date(e.date).getTime()-new Date(t.date).getTime()),a=t.slice(-7),i=t.slice(-14,-7);if(0===i.length)return 0;let s=a.reduce((e,t)=>e+t.recoveryScore,0)/a.length,r=i.reduce((e,t)=>e+t.recoveryScore,0)/i.length;return 0===r?0:Math.round((s-r)/r*100)}function c(e){if(0===e.length)return 50;let t=[...e].sort((e,t)=>new Date(t.date).getTime()-new Date(e.date).getTime()).slice(0,7),a=t.filter(e=>e.consumed).length,i=t.reduce((e,t)=>e+t.moodScore,0)/t.length,s=t.reduce((e,t)=>e+t.sleepHours,0)/t.length,r=a/Math.max(t.length,1)*50;return i<3&&(r+=20),s<6&&(r+=15),s>10&&(r+=10),Math.min(Math.max(Math.round(r),0),100)}let m={alcohol:{early:[{mealTime:"breakfast",foods:["Oatmeal with blueberries","Scrambled eggs with spinach","Green tea"],benefits:"B-vitamins and antioxidants to repair liver damage"},{mealTime:"lunch",foods:["Grilled salmon with quinoa","Steamed broccoli","Lemon water"],benefits:"Omega-3 fatty acids reduce inflammation and support brain repair"},{mealTime:"dinner",foods:["Chicken soup with vegetables","Brown rice","Herbal tea"],benefits:"Easy-to-digest meals help restore gut health"},{mealTime:"snack",foods:["Greek yogurt with walnuts","Apple slices","Chamomile tea"],benefits:"Probiotics and healthy fats for nutrient absorption"}],mid:[{mealTime:"breakfast",foods:["Whole grain toast with avocado","Poached eggs","Fresh orange juice"],benefits:"Healthy fats and folate to rebuild liver cells"},{mealTime:"lunch",foods:["Lean turkey wrap with leafy greens","Sweet potato soup","Water with lemon"],benefits:"Lean protein and complex carbs for sustained energy"},{mealTime:"dinner",foods:["Baked cod with asparagus","Wild rice pilaf","Beetroot salad"],benefits:"Beetroot supports liver detoxification pathways"},{mealTime:"snack",foods:["Mixed berries smoothie","Almonds","Turmeric milk"],benefits:"Anti-inflammatory compounds accelerate healing"}],late:[{mealTime:"breakfast",foods:["Acai bowl with granola","Boiled eggs","Matcha latte"],benefits:"Sustained energy and antioxidant protection"},{mealTime:"lunch",foods:["Mediterranean salad with chickpeas","Whole grain bread","Kombucha"],benefits:"Fermented foods restore healthy gut microbiome"},{mealTime:"dinner",foods:["Grilled chicken with roasted vegetables","Lentil soup","Mint tea"],benefits:"Complete protein for long-term tissue maintenance"},{mealTime:"snack",foods:["Dark chocolate (70%+)","Trail mix","Coconut water"],benefits:"Magnesium and potassium for nerve function"}]},smoking:{early:[{mealTime:"breakfast",foods:["Citrus fruit salad","Whole grain cereal with milk","Ginger tea"],benefits:"Vitamin C repairs lung tissue damaged by smoking"},{mealTime:"lunch",foods:["Carrot and ginger soup","Grilled chicken breast","Steamed kale"],benefits:"Beta-carotene and vitamin A help regenerate respiratory cells"},{mealTime:"dinner",foods:["Baked sweet potato","Steamed fish with turmeric","Garlic sauteed greens"],benefits:"Anti-inflammatory compounds reduce airway swelling"},{mealTime:"snack",foods:["Orange slices","Celery with hummus","Green smoothie"],benefits:"Crunchy vegetables reduce oral cravings"}],mid:[{mealTime:"breakfast",foods:["Pomegranate yogurt bowl","Whole wheat toast","Berry smoothie"],benefits:"Polyphenols protect lung cells from oxidative stress"},{mealTime:"lunch",foods:["Tomato and lentil soup","Spinach and feta wrap","Apple cider water"],benefits:"Lycopene and iron boost oxygen-carrying capacity"},{mealTime:"dinner",foods:["Salmon with garlic butter","Roasted Brussels sprouts","Quinoa"],benefits:"Omega-3s reduce lung inflammation and improve breathing"},{mealTime:"snack",foods:["Carrot sticks with guacamole","Pineapple chunks","Peppermint tea"],benefits:"Healthy fats improve nutrient absorption"}],late:[{mealTime:"breakfast",foods:["Chia seed pudding with mango","Almond butter toast","Warm lemon water"],benefits:"Omega-3 rich seeds for long-term lung health"},{mealTime:"lunch",foods:["Grilled vegetable and halloumi salad","Bone broth","Kiwi"],benefits:"Collagen-building nutrients strengthen airways"},{mealTime:"dinner",foods:["Turkey stir-fry with bell peppers","Brown rice noodles","Jasmine tea"],benefits:"Vitamin C-rich peppers maintain respiratory immunity"},{mealTime:"snack",foods:["Brazil nuts","Grapefruit","Golden milk"],benefits:"Selenium and antioxidants for cellular repair"}]},drugs:{early:[{mealTime:"breakfast",foods:["Banana and peanut butter smoothie","Whole grain toast","Warm milk with honey"],benefits:"Tryptophan and potassium support neurotransmitter recovery"},{mealTime:"lunch",foods:["Lentil and vegetable stew","Brown rice","Fresh fruit"],benefits:"Complex carbs stabilize blood sugar for steady mood"},{mealTime:"dinner",foods:["Baked chicken thigh","Mashed sweet potato","Steamed green beans"],benefits:"Amino acids from protein rebuild depleted neurotransmitters"},{mealTime:"snack",foods:["Hard-boiled eggs","Handful of cashews","Chamomile tea"],benefits:"Choline and magnesium support brain chemistry balance"}],mid:[{mealTime:"breakfast",foods:["Eggs benedict with smoked salmon","Avocado toast","Green juice"],benefits:"DHA and healthy fats rebuild brain cell membranes"},{mealTime:"lunch",foods:["Chicken and avocado bowl","Black beans","Fermented vegetables"],benefits:"Gut-brain axis support with probiotics and fiber"},{mealTime:"dinner",foods:["Grilled steak with roasted garlic","Baked potato","Sauteed mushrooms"],benefits:"Iron and B12 reverse cognitive fatigue"},{mealTime:"snack",foods:["Dark chocolate squares","Walnuts","Turmeric latte"],benefits:"Flavonoids improve blood flow to the brain"}],late:[{mealTime:"breakfast",foods:["Overnight oats with berries and flax","Greek yogurt","Matcha tea"],benefits:"Sustained-release energy supports stable neurotransmitter levels"},{mealTime:"lunch",foods:["Tuna and white bean salad","Sourdough bread","Olive oil dressing"],benefits:"Omega-3 rich fish maintains cognitive function"},{mealTime:"dinner",foods:["Herb-crusted salmon","Roasted root vegetables","Quinoa tabbouleh"],benefits:"Complete nutrition for long-term brain health maintenance"},{mealTime:"snack",foods:["Pumpkin seeds","Blueberry muffin (whole grain)","Ginkgo tea"],benefits:"Zinc and antioxidants for memory and focus"}]},food:{early:[{mealTime:"breakfast",foods:["1/2 cup steel-cut oats","1 small banana","Black coffee or tea"],benefits:"Portion-controlled complex carbs prevent blood sugar spikes"},{mealTime:"lunch",foods:["4oz grilled chicken","Large mixed salad","1 tbsp olive oil dressing"],benefits:"High-protein, high-fiber meal promotes lasting satiety"},{mealTime:"dinner",foods:["4oz baked fish","1 cup roasted vegetables","1/2 cup brown rice"],benefits:"Balanced macronutrients prevent binge triggers"},{mealTime:"snack",foods:["10 almonds","1 small apple","Herbal tea"],benefits:"Pre-portioned snacks build mindful eating habits"}],mid:[{mealTime:"breakfast",foods:["Veggie egg white omelette","1 slice whole grain toast","Green tea"],benefits:"High-protein start reduces mid-morning cravings"},{mealTime:"lunch",foods:["Turkey lettuce wraps","Cucumber and tomato salad","Sparkling water"],benefits:"Low-calorie-density foods help relearn hunger signals"},{mealTime:"dinner",foods:["Grilled shrimp skewers","Cauliflower rice","Steamed edamame"],benefits:"Satisfying textures without excess calories"},{mealTime:"snack",foods:["Cottage cheese with berries","Celery sticks","Water with mint"],benefits:"Protein-rich snacks stabilize appetite hormones"}],late:[{mealTime:"breakfast",foods:["Smoothie bowl with protein powder","Fresh fruit topping","Matcha"],benefits:"Customizable yet portion-aware meal building"},{mealTime:"lunch",foods:["Buddha bowl with tofu","Mixed grains","Tahini dressing"],benefits:"Intuitive eating with balanced, colorful plates"},{mealTime:"dinner",foods:["Lean beef stir-fry","Zucchini noodles","Miso soup"],benefits:"Satisfying meals that maintain healthy relationship with food"},{mealTime:"snack",foods:["Rice cakes with avocado","Cherry tomatoes","Rooibos tea"],benefits:"Mindful snacking as a sustainable lifelong habit"}]}},u={alcohol:["All alcoholic beverages","Foods cooked with alcohol","Sugary drinks (trigger cravings)","Processed foods high in sugar","Excessive caffeine"],smoking:["Spicy foods (increase oral irritation)","Excessive caffeine","Highly processed snacks","Sugary foods (blood sugar crashes)","Red meat in excess"],drugs:["Excessive sugar and candy","Highly caffeinated energy drinks","Processed junk food","Alcohol","Foods with artificial stimulants"],food:["Trigger foods (personal list)","Ultra-processed snacks","Sugary beverages","Large portions of refined carbs","Eating directly from packages"]},h={alcohol:{early:"Drink at least 10 glasses of water daily. Add electrolyte drinks to restore mineral balance depleted by alcohol.",mid:"Maintain 8-10 glasses of water. Try herbal teas like dandelion root for liver support.",late:"Keep hydrated with 8 glasses daily. Infused water with cucumber or berries makes a great alcohol-free ritual."},smoking:{early:"Drink 8-12 glasses of water to flush nicotine. Add honey-lemon water to soothe throat irritation.",mid:"Stay with 8-10 glasses daily. Green tea and warm water with ginger help clear respiratory congestion.",late:"Maintain 8 glasses. Herbal teas like peppermint and eucalyptus support clear breathing."},drugs:{early:"Hydrate heavily with 10+ glasses. Water helps flush toxins and supports kidney recovery.",mid:"Keep at 8-10 glasses. Coconut water helps restore electrolytes and supports brain hydration.",late:"Maintain 8 glasses. Bone broth and herbal teas provide minerals alongside hydration."},food:{early:"Drink a glass of water 20 minutes before each meal. Aim for 8 glasses to distinguish thirst from hunger.",mid:"Continue pre-meal water habit. Sparkling water can satisfy oral fixation without calories.",late:"Maintain intuitive hydration. Listen to your body and sip water throughout the day."}},g={alcohol:"Alcohol",smoking:"Smoking",drugs:"Substance",food:"Food/Eating"};function p(e,t,a){let i=function(e,t,a){let i=g[t]||"Addiction",s=[],r=Math.min(a,12);for(let e=1;e<=r;e++){let a=e<=Math.ceil(.3*r)?"early":e<=Math.ceil(.7*r)?"mid":"late",o={week:e,goals:[],activities:[],tips:[],nutrition:function(e,t){let a=m[e]?.[t]||m.alcohol[t],i=u[e]||u.alcohol,s=h[e]?.[t]||"Drink at least 8 glasses of water daily.";return{phase:t,meals:a,hydrationTip:s,avoidFoods:i}}(t,a)};"early"===a?(o.goals=[`Reduce ${i.toLowerCase()} intake by ${Math.min(15*e,50)}%`,"Establish daily routine","Identify triggers"],o.activities=["Morning meditation (10 min)","Evening journaling","Light walking (20 min)","Deep breathing exercises"],o.tips=["Remove triggers from your environment","Stay hydrated throughout the day","Reach out to a support person daily"]):"mid"===a?(o.goals=[`Maintain reduced ${i.toLowerCase()} usage`,"Build healthy coping mechanisms","Strengthen social connections"],o.activities=["Exercise (30 min)","Hobby or creative activity (1 hr)","Support group meeting","Mindfulness practice"],o.tips=["Celebrate small victories","Practice saying no in low-pressure situations","Eat balanced, nutritious meals"]):(o.goals=[`Work toward full ${i.toLowerCase()} abstinence`,"Establish long-term relapse prevention","Plan for independent maintenance"],o.activities=["Vigorous exercise (45 min)","Volunteer or community engagement","Weekly progress review","Stress management workshop"],o.tips=["Create a relapse prevention plan","Identify and avoid high-risk situations","Build a long-term support network"]),s.push(o)}return s}(0,t,a);return{severity:e,addictionType:t,weeks:i,rehabRecommended:"High"===e||"Critical"===e}}e.s(["calculateDailyRecoveryScore",()=>l,"calculateDiseaseRisk",()=>r,"calculateOrganRisk",()=>i,"calculateRelapseRisk",()=>c,"calculateWeeklyImprovement",()=>d,"classifySeverity",()=>t,"estimateRecoveryWeeks",()=>o,"generateRecoveryPlan",()=>p,"runAssessment",()=>n])},71148,e=>{"use strict";var t=e.i(27790),a=e.i(5928),i=e.i(20236),s=e.i(98951),r=e.i(29736),o=e.i(89265),n=e.i(90068),l=e.i(24993),d=e.i(64064);let c=(0,d.default)("download",[["path",{d:"M12 15V3",key:"m9g1x1"}],["path",{d:"M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4",key:"ih7n3h"}],["path",{d:"m7 10 5 5 5-5",key:"brsn70"}]]);var m=e.i(1861);let u=(0,d.default)("printer",[["path",{d:"M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2",key:"143wyd"}],["path",{d:"M6 9V3a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v6",key:"1itne7"}],["rect",{x:"6",y:"14",width:"12",height:"8",rx:"1",key:"1ue0tg"}]]);var h=e.i(26603),g=e.i(71878),p=e.i(66840);let f={alcohol:"Alcohol",smoking:"Smoking / Tobacco",drugs:"Drugs / Substances",food:"Food / Eating"};function b(e,t,a,i){let s=(0,p.calculateWeeklyImprovement)(t),r=(0,p.calculateRelapseRisk)(t),o=new Date().toLocaleDateString("en-US",{year:"numeric",month:"long",day:"numeric"});return`
<!DOCTYPE html>
<html>
<head>
<style>
  @page { margin: 40px; }
  @media print {
    * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; color-adjust: exact !important; }
  }
  body { font-family: 'Helvetica Neue', Arial, sans-serif; color: #1a1a2e; line-height: 1.6; margin: 0; padding: 40px; }
  .header { text-align: center; margin-bottom: 32px; border-bottom: 3px solid #2563eb; padding-bottom: 20px; }
  .header h1 { color: #2563eb; font-size: 28px; margin: 0; }
  .header p { color: #6b7280; font-size: 14px; margin: 4px 0; }
  .section { margin-bottom: 28px; }
  .section h2 { color: #2563eb; font-size: 18px; border-bottom: 1px solid #e5e7eb; padding-bottom: 8px; margin-bottom: 12px; }
  .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
  .stat-box { background: #f0f4ff; border-radius: 8px; padding: 14px; }
  .stat-box .label { font-size: 12px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; }
  .stat-box .value { font-size: 22px; font-weight: 700; color: #1a1a2e; margin-top: 2px; }
  .stat-box .sub { font-size: 12px; color: #6b7280; }
  table { width: 100%; border-collapse: collapse; margin-top: 8px; }
  th, td { padding: 8px 12px; text-align: left; border-bottom: 1px solid #e5e7eb; font-size: 14px; }
  th { background: #f0f4ff; color: #2563eb; font-weight: 600; }
  .badge { display: inline-block; padding: 3px 10px; border-radius: 12px; font-size: 12px; font-weight: 600; }
  .badge-low { background: #d1fae5 !important; color: #065f46 !important; }
  .badge-moderate { background: #fef3c7 !important; color: #92400e !important; }
  .badge-high { background: #fee2e2 !important; color: #991b1b !important; }
  .badge-critical { background: #fca5a5 !important; color: #7f1d1d !important; }
  .bar { height: 16px; border-radius: 8px; background: #e5e7eb; margin-top: 4px; }
  .bar-fill { height: 100%; border-radius: 8px; display: block; }
  .bar-fill-red { background: #ef4444 !important; }
  .bar-fill-orange { background: #f59e0b !important; }
  .bar-fill-green { background: #10b981 !important; }
  .bar-fill-blue { background: #2563eb !important; }
  .bar-fill-purple { background: #8b5cf6 !important; }
  .disclaimer { margin-top: 40px; padding: 16px; background: #fef3c7 !important; border-radius: 8px; font-size: 12px; color: #92400e; }
  .footer { text-align: center; margin-top: 32px; font-size: 12px; color: #9ca3af; }
</style>
</head>
<body>
  <div class="header">
    <h1>RecoverAI Assessment Report</h1>
    <p>Generated on ${o} for ${i}</p>
    <p>AI Addiction Severity Analysis & Smart Recovery System</p>
  </div>

  <div class="section">
    <h2>User Summary</h2>
    <div class="grid">
      <div class="stat-box">
        <div class="label">Name</div>
        <div class="value" style="font-size: 16px;">${i}</div>
      </div>
      <div class="stat-box">
        <div class="label">Age</div>
        <div class="value">${e.input.age}</div>
      </div>
      <div class="stat-box">
        <div class="label">Addiction Type</div>
        <div class="value" style="font-size: 16px;">${f[e.input.addictionType]||e.input.addictionType}</div>
      </div>
      <div class="stat-box">
        <div class="label">Duration</div>
        <div class="value">${e.input.durationYears} years</div>
      </div>
    </div>
  </div>

  <div class="section">
    <h2>Severity Analysis</h2>
    <div class="grid">
      <div class="stat-box">
        <div class="label">Severity Score</div>
        <div class="value">${e.severityScore}/100</div>
        <div class="sub">
          <span class="badge badge-${e.severityLevel.toLowerCase()}">${e.severityLevel}</span>
        </div>
      </div>
      <div class="stat-box">
        <div class="label">Recovery Estimate</div>
        <div class="value">${e.recoveryWeeks} weeks</div>
        <div class="sub">~${Math.round(e.recoveryWeeks/4.3)} months</div>
      </div>
    </div>
  </div>

  <div class="section">
    <h2>Organ Risk Assessment</h2>
    <table>
      <thead>
        <tr><th>Organ</th><th>Risk Level</th><th>Visual</th></tr>
      </thead>
      <tbody>
        ${Object.entries(e.organRisk).map(([e,t])=>`
        <tr>
          <td style="text-transform: capitalize; font-weight: 500;">${e}</td>
          <td>${t}%</td>
          <td>
            <div class="bar">
              <div class="bar-fill ${t>60?"bar-fill-red":t>30?"bar-fill-orange":"bar-fill-green"}" style="width: ${t}%; background: ${t>60?"#ef4444":t>30?"#f59e0b":"#10b981"} !important;"></div>
            </div>
          </td>
        </tr>`).join("")}
      </tbody>
    </table>
  </div>

  <div class="section">
    <h2>Disease Risk Predictions</h2>
    <table>
      <thead>
        <tr><th>Disease</th><th>Probability</th><th>Visual</th></tr>
      </thead>
      <tbody>
        <tr>
          <td>Stroke</td>
          <td>${Math.round(100*e.diseaseRisk.stroke)}%</td>
          <td><div class="bar"><div class="bar-fill bar-fill-blue" style="width: ${100*e.diseaseRisk.stroke}%; background: #2563eb !important;"></div></div></td>
        </tr>
        <tr>
          <td>Cancer</td>
          <td>${Math.round(100*e.diseaseRisk.cancer)}%</td>
          <td><div class="bar"><div class="bar-fill bar-fill-red" style="width: ${100*e.diseaseRisk.cancer}%; background: #ef4444 !important;"></div></div></td>
        </tr>
        <tr>
          <td>Heart Disease</td>
          <td>${Math.round(100*e.diseaseRisk.heartDisease)}%</td>
          <td><div class="bar"><div class="bar-fill bar-fill-purple" style="width: ${100*e.diseaseRisk.heartDisease}%; background: #8b5cf6 !important;"></div></div></td>
        </tr>
        <tr>
          <td>Diabetes</td>
          <td>${Math.round(100*e.diseaseRisk.diabetes)}%</td>
          <td><div class="bar"><div class="bar-fill bar-fill-orange" style="width: ${100*e.diseaseRisk.diabetes}%; background: #f59e0b !important;"></div></div></td>
        </tr>
      </tbody>
    </table>
  </div>

  <div class="section">
    <h2>Recovery Tracking Summary</h2>
    <div class="grid">
      <div class="stat-box">
        <div class="label">Days Tracked</div>
        <div class="value">${t.length}</div>
      </div>
      <div class="stat-box">
        <div class="label">Weekly Improvement</div>
        <div class="value">${s>=0?"+":""}${s}%</div>
      </div>
      <div class="stat-box">
        <div class="label">Relapse Risk</div>
        <div class="value">${r}%</div>
        <div class="sub">${r<=30?"Low":r<=60?"Moderate":"High"} risk</div>
      </div>
      <div class="stat-box">
        <div class="label">Average Recovery Score</div>
        <div class="value">${t.length>0?Math.round(t.reduce((e,t)=>e+t.recoveryScore,0)/t.length):"N/A"}</div>
      </div>
    </div>
  </div>

  ${a?`
  <div class="section">
    <h2>Recommendations</h2>
    ${a.rehabRecommended?'<p style="color: #991b1b; font-weight: 600;">Professional rehabilitation treatment is strongly recommended based on your severity level.</p>':""}
    <ul style="padding-left: 20px;">
      ${a.weeks[0]?.goals.map(e=>`<li>${e}</li>`).join("")||""}
      ${a.weeks[0]?.tips.map(e=>`<li>${e}</li>`).join("")||""}
    </ul>
  </div>`:""}

  <div class="disclaimer">
    <strong>Important Disclaimer:</strong> This report is generated by an AI algorithm for educational and informational purposes only.
    It does not constitute medical diagnosis or treatment advice. Always consult with qualified healthcare professionals
    for medical decisions regarding addiction and recovery.
  </div>

  <div class="footer">
    <p>RecoverAI - AI Addiction Severity Analysis & Smart Recovery System</p>
    <p>Report ID: ${e.id} | Generated: ${o}</p>
  </div>
</body>
</html>
  `.trim()}let v={alcohol:"Alcohol",smoking:"Smoking / Tobacco",drugs:"Drugs / Substances",food:"Food / Eating"};function x(){let[e,d]=(0,a.useState)(null),[p,f]=(0,a.useState)([]),[x,y]=(0,a.useState)(null),[k,w]=(0,a.useState)(!1);if((0,a.useEffect)(()=>{d(g.store.getLatestAssessment()),f(g.store.getDailyLogs()),y(g.store.getRecoveryPlan()),w(!0)},[]),!k)return null;let j=g.store.getUser();if(!e)return(0,t.jsxs)("div",{className:"flex flex-col items-center justify-center py-20",children:[(0,t.jsx)("div",{className:"flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10",children:(0,t.jsx)(m.FileText,{className:"h-8 w-8 text-primary"})}),(0,t.jsx)("h2",{className:"mt-6 text-2xl font-bold text-foreground font-serif",children:"No Report Available"}),(0,t.jsx)("p",{className:"mt-2 max-w-md text-center text-muted-foreground",children:"Complete an assessment first to generate a downloadable report."}),(0,t.jsx)(i.default,{href:"/assessment",className:"mt-6",children:(0,t.jsxs)(s.Button,{size:"lg",className:"gap-2",children:["Take Assessment",(0,t.jsx)(l.ArrowRight,{className:"h-4 w-4"})]})})]});let T=g.store.getAssessments();return(0,t.jsxs)("div",{className:"flex flex-col gap-8",children:[(0,t.jsxs)("div",{className:"flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between print:hidden sticky top-0 bg-background z-10 py-4",children:[(0,t.jsxs)("div",{className:"flex items-center gap-3",children:[(0,t.jsx)("div",{className:"flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10",children:(0,t.jsx)(m.FileText,{className:"h-5 w-5 text-primary"})}),(0,t.jsxs)("div",{children:[(0,t.jsx)("h1",{className:"text-2xl font-bold text-foreground font-serif",children:"Reports"}),(0,t.jsx)("p",{className:"text-sm text-muted-foreground",children:"View and download your assessment reports"})]})]}),(0,t.jsxs)("div",{className:"flex items-center gap-2",children:[(0,t.jsxs)(s.Button,{variant:"outline",size:"sm",onClick:function(){if(!e)return;let t=b(e,p,x,j?.name||"User"),a=document.createElement("iframe");a.style.display="none",document.body.appendChild(a);let i=a.contentDocument||a.contentWindow?.document;i&&(i.open(),i.write(t),i.close(),a.onload=()=>{a.contentWindow?.print(),setTimeout(()=>document.body.removeChild(a),1e3)})},className:"gap-2",children:[(0,t.jsx)(u,{className:"h-4 w-4"}),"Print"]}),(0,t.jsxs)(s.Button,{size:"sm",onClick:function(){if(!e)return;let t=b(e,p,x,j?.name||"User"),a=window.open("","_blank");a?(a.document.write(t),a.document.close(),a.onload=()=>{a.print()},h.toast.success("Report opened. Use Print > Save as PDF to download.")):h.toast.error("Pop-up blocked. Please allow pop-ups and try again.")},className:"gap-2",children:[(0,t.jsx)(c,{className:"h-4 w-4"}),"Download PDF"]})]})]}),(0,t.jsxs)(r.Card,{children:[(0,t.jsxs)(r.CardHeader,{children:[(0,t.jsx)(r.CardTitle,{className:"text-base",children:"Latest Assessment Report"}),(0,t.jsx)(r.CardDescription,{children:new Date(e.date).toLocaleDateString("en-US",{month:"long",day:"numeric",year:"numeric"})})]}),(0,t.jsxs)(r.CardContent,{children:[(0,t.jsxs)("div",{className:"grid gap-6 sm:grid-cols-2 lg:grid-cols-4",children:[(0,t.jsxs)("div",{className:"rounded-lg bg-secondary p-4",children:[(0,t.jsx)("p",{className:"text-xs font-medium text-muted-foreground uppercase tracking-wide",children:"Severity"}),(0,t.jsxs)("p",{className:"mt-1 text-2xl font-bold text-foreground",children:[e.severityScore,"/100"]}),(0,t.jsx)(o.Badge,{variant:"Low"===e.severityLevel?"secondary":"Moderate"===e.severityLevel?"outline":"destructive",className:"mt-1",children:e.severityLevel})]}),(0,t.jsxs)("div",{className:"rounded-lg bg-secondary p-4",children:[(0,t.jsx)("p",{className:"text-xs font-medium text-muted-foreground uppercase tracking-wide",children:"Type"}),(0,t.jsx)("p",{className:"mt-1 text-lg font-bold text-foreground",children:v[e.input.addictionType]}),(0,t.jsxs)("p",{className:"text-sm text-muted-foreground",children:[e.input.durationYears," years"]})]}),(0,t.jsxs)("div",{className:"rounded-lg bg-secondary p-4",children:[(0,t.jsx)("p",{className:"text-xs font-medium text-muted-foreground uppercase tracking-wide",children:"Recovery Est."}),(0,t.jsxs)("p",{className:"mt-1 text-2xl font-bold text-foreground",children:[e.recoveryWeeks,"w"]}),(0,t.jsxs)("p",{className:"text-sm text-muted-foreground",children:["~",Math.round(e.recoveryWeeks/4.3)," months"]})]}),(0,t.jsxs)("div",{className:"rounded-lg bg-secondary p-4",children:[(0,t.jsx)("p",{className:"text-xs font-medium text-muted-foreground uppercase tracking-wide",children:"Days Tracked"}),(0,t.jsx)("p",{className:"mt-1 text-2xl font-bold text-foreground",children:p.length}),(0,t.jsx)("p",{className:"text-sm text-muted-foreground",children:"daily entries"})]})]}),(0,t.jsx)(n.Separator,{className:"my-6"}),(0,t.jsxs)("div",{children:[(0,t.jsx)("h3",{className:"mb-3 text-sm font-semibold text-foreground",children:"Organ Risk Summary"}),(0,t.jsx)("div",{className:"flex flex-col gap-3",children:Object.entries(e.organRisk).map(([e,a])=>(0,t.jsxs)("div",{className:"flex items-center gap-4",children:[(0,t.jsx)("span",{className:"w-16 text-sm font-medium capitalize text-foreground",children:e}),(0,t.jsx)("div",{className:"flex-1",children:(0,t.jsx)("div",{className:"h-3 overflow-hidden rounded-full bg-muted",children:(0,t.jsx)("div",{className:"h-full rounded-full transition-all duration-700",style:{width:`${a}%`,backgroundColor:a>60?"hsl(var(--destructive))":a>30?"hsl(var(--chart-4))":"hsl(var(--chart-2))"}})})}),(0,t.jsxs)("span",{className:"w-12 text-right text-sm font-medium text-foreground",children:[a,"%"]})]},e))})]}),(0,t.jsx)(n.Separator,{className:"my-6"}),(0,t.jsxs)("div",{children:[(0,t.jsx)("h3",{className:"mb-3 text-sm font-semibold text-foreground",children:"Disease Risk Summary"}),(0,t.jsx)("div",{className:"flex flex-col gap-3",children:[{label:"Stroke",value:e.diseaseRisk.stroke},{label:"Cancer",value:e.diseaseRisk.cancer},{label:"Heart Disease",value:e.diseaseRisk.heartDisease},{label:"Diabetes",value:e.diseaseRisk.diabetes}].map(e=>(0,t.jsxs)("div",{className:"flex items-center gap-4",children:[(0,t.jsx)("span",{className:"w-28 text-sm font-medium text-foreground",children:e.label}),(0,t.jsx)("div",{className:"flex-1",children:(0,t.jsx)("div",{className:"h-3 overflow-hidden rounded-full bg-muted",children:(0,t.jsx)("div",{className:"h-full rounded-full bg-primary transition-all duration-700",style:{width:`${Math.round(100*e.value)}%`}})})}),(0,t.jsxs)("span",{className:"w-12 text-right text-sm font-medium text-foreground",children:[Math.round(100*e.value),"%"]})]},e.label))})]})]})]}),T.length>1&&(0,t.jsxs)(r.Card,{children:[(0,t.jsxs)(r.CardHeader,{children:[(0,t.jsx)(r.CardTitle,{className:"text-base",children:"Assessment History"}),(0,t.jsxs)(r.CardDescription,{children:["All ",T.length," assessments"]})]}),(0,t.jsx)(r.CardContent,{children:(0,t.jsx)("div",{className:"flex flex-col gap-3",children:T.slice().reverse().map((e,a)=>(0,t.jsxs)("div",{children:[a>0&&(0,t.jsx)(n.Separator,{className:"mb-3"}),(0,t.jsxs)("div",{className:"flex items-center justify-between",children:[(0,t.jsxs)("div",{children:[(0,t.jsxs)("p",{className:"text-sm font-medium text-foreground",children:[new Date(e.date).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"})," ","-"," ",v[e.input.addictionType]]}),(0,t.jsxs)("p",{className:"text-xs text-muted-foreground",children:["Duration: ",e.input.durationYears,"y | Frequency:"," ",e.input.frequencyPerWeek,"x/week"]})]}),(0,t.jsxs)("div",{className:"text-right",children:[(0,t.jsx)("p",{className:"text-lg font-bold text-foreground",children:e.severityScore}),(0,t.jsx)(o.Badge,{variant:"Low"===e.severityLevel?"secondary":"Moderate"===e.severityLevel?"outline":"destructive",children:e.severityLevel})]})]})]},e.id))})})]})]})}e.s(["default",()=>x],71148)}]);