import { initializeApp } from 'https://www.gstatic.com/firebasejs/12.15.0/firebase-app.js';
import { getAnalytics, isSupported as analyticsSupported } from 'https://www.gstatic.com/firebasejs/12.15.0/firebase-analytics.js';
import { getFirestore, doc, getDoc, setDoc, onSnapshot, collection, serverTimestamp, getDocs, writeBatch } from 'https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js';
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut, setPersistence, browserLocalPersistence, browserSessionPersistence } from 'https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js';

const firebaseConfig = {
  apiKey: 'AIzaSyDRGvJnNDdraqUjWRnrZ3HQVr2ic0piVCE',
  authDomain: 'marketing-plan-5f2a4.firebaseapp.com',
  projectId: 'marketing-plan-5f2a4',
  storageBucket: 'marketing-plan-5f2a4.firebasestorage.app',
  messagingSenderId: '577412511657',
  appId: '1:577412511657:web:5115af794d95e29acef6b8',
  measurementId: 'G-JL3XTTGVZX'
};
const firebaseApp = initializeApp(firebaseConfig);
analyticsSupported().then(ok => { if (ok) getAnalytics(firebaseApp); }).catch(()=>{});
const db = getFirestore(firebaseApp);
const auth = getAuth(firebaseApp);

const SCHEMA = window.IQVIA_DATA?.schema || ['atc1','atc2','atc3','atc4','molecule','product','manufacturer','sku','pack','nfc','py1Usd','cyUsd','py1Unit','cyUnit','py2Usd','py2Unit','companyBrand','strength','dosage','brandName','month'];
const ADMIN_EMAIL = 'azhar.mohd.said@gmail.com';
const IAM_LINK = 'https://console.firebase.google.com/u/0/project/marketing-plan-5f2a4/settings/iam?fb_gclid=CjwKCAjwhLPOBhBiEiwA8_wJHIlgxlau3IFYi5fkak5blaDZqkVSJpMSQK0Uu08yF1do1purGXyaWBoCBwYQAvD_BwE&fb_utm_campaign=Cloud-SS-DR-Firebase-FY26-global-gsem-1713590&fb_utm_content=text-ad&fb_utm_medium=cpc&fb_utm_source=google&fb_utm_term=KW_firebase';
const AUTH_USERS_LINK = 'https://console.firebase.google.com/u/0/project/marketing-plan-5f2a4/authentication/users';

const COUNTRIES = {
  JO: { label:'Jordan', flag:'🇯🇴', flagColors:['#111827','#ffffff','#0f7b3a'], source:'IQVIA – MIDAS MAT/YTD' },
  KSA:{ label:'Saudi Arabia', flag:'🇸🇦', flagColors:['#006c35','#ffffff','#006c35'], source:'IQVIA – MIDAS MAT/YTD' },
  UAE:{ label:'United Arab Emirates', flag:'🇦🇪', flagColors:['#d71920','#ffffff','#00732f'], source:'IQVIA – MIDAS MAT/YTD' },
  IRQ:{ label:'Iraq', flag:'🇮🇶', flagColors:['#ce1126','#ffffff','#000000'], source:'Data pending' },
  ALG:{ label:'Algeria', flag:'🇩🇿', flagColors:['#006233','#ffffff','#d21034'], source:'Data pending' }
};

const BASE_PRODUCTS = {
  'Mixif - Murex': { ingredient:'Cefixime', moleculeGroups:[['CEFIXIME']], brandKeywords:['MIXIF','MUREX'] },
  'Ciprodar - Qurex': { ingredient:'Ciprofloxacin', moleculeGroups:[['CIPROFLOXACIN']], brandKeywords:['CIPRODAR','QUREX'] },
  'Hairgrow': { ingredient:'Minoxidil', moleculeGroups:[['MINOXIDIL']], brandKeywords:['HAIRGROW'] },
  'Deplazine': { ingredient:'Dapagliflozin', moleculeGroups:[['DAPAGLIFLOZIN']], brandKeywords:['DEPLAZINE','DEPLAZEN'] },
  'Glunorm': { ingredient:'Vildagliptin', moleculeGroups:[['VILDAGLIPTIN']], brandKeywords:['GLUNORM'] },
  'Glunorm M': { ingredient:'Vildagliptin + Metformin', moleculeGroups:[['VILDAGLIPTIN','METFORMIN']], brandKeywords:['GLUNORM M','GLUNORM-M'] },
  'Rozzita': { ingredient:'Rosuvastatin', moleculeGroups:[['ROSUVASTATIN']], brandKeywords:['ROZZITA','ROZITTA'] },
  'Gizlan': { ingredient:'Irbesartan / Irbesartan + HCT / Irbesartan + Amlodipine', moleculeGroups:[['IRBESARTAN'],['IRBESARTAN','HYDROCHLOROTHIAZIDE'],['IRBESARTAN','AMLODIPINE']], brandKeywords:['GIZLAN'] },
  'Matador': { ingredient:'Levofloxacin', moleculeGroups:[['LEVOFLOXACIN']], brandKeywords:['MATADOR'] },
  'Clavodar': { ingredient:'Amoxicillin + Clavulanic Acid', moleculeGroups:[['AMOXICILLIN','CLAVULANIC ACID']], brandKeywords:['CLAVODAR'] }
};
const BASE_MANAGERS = {
  'Azhar Said': ['Mixif - Murex','Ciprodar - Qurex','Hairgrow'],
  'Abdallah Nasser': ['Matador','Clavodar'],
  'Isam Aljundi': ['Deplazine','Glunorm','Glunorm M','Rozzita','Gizlan'],
  'Admin': Object.keys(BASE_PRODUCTS)
};
const BASE_USERS = {
  'abdallah.nasser@dadgroup.com': { name:'Abdallah Nasser', role:'manager' },
  'isam.aljundi@dadgroup.com': { name:'Isam Aljundi', role:'manager' },
  'azhar.said@dadgroup.com': { name:'Azhar Said', role:'manager' },
  'azhar.mohd.said@gmail.com': { name:'Admin', role:'admin' }
};

const COUNTRY_PLAYBOOK = {
  JO:{channel:'private retail and specialist-led demand', access:'high pharmacy influence with strong private-sector conversion pressure', execution:'prioritize targeted HCP engagement, pharmacy activation, and account-by-account availability', healthcare:['Private retail pharmacies remain central to conversion and prescription protection.','Cash-payer sensitivity makes pack affordability and price corridor relevant.','Institutional and governmental channels should be evaluated separately from retail IQVIA trends.']},
  KSA:{channel:'large private retail and institutional ecosystem', access:'broad geographic coverage and access discipline', execution:'prioritize regional segmentation, key-account discipline, and evidence-led stakeholder engagement', healthcare:['Private chains and institutional access both influence scale.','City/account prioritization should drive field coverage.','Access assumptions should separate retail, insurance, and institutional routes.']},
  UAE:{channel:'competitive private retail and insurance-influenced market', access:'brand choice shaped by insurance, chains, and specialist recommendation', execution:'prioritize differentiated positioning, chain execution, and high-quality digital touchpoints', healthcare:['Private-provider networks influence patient flow.','Pharmacy-chain execution and counseling are important conversion levers.','Awareness activities should be precise, compliant, and premium in execution.']},
  IRQ:{channel:'data pending market', access:'IQVIA files are pending', execution:'keep assumptions editable and upload data once available', healthcare:['Country data is pending.','Keep access and channel assumptions editable.','Use the monthly IQVIA update workflow once files are available.']},
  ALG:{channel:'data pending market', access:'IQVIA files are pending', execution:'keep assumptions editable and upload data once available', healthcare:['Country data is pending.','Keep access and channel assumptions editable.','Use the monthly IQVIA update workflow once files are available.']}
};

const BRAND = {
  'Mixif - Murex': {area:'oral third-generation cephalosporin antibiotic', patients:['Adults with UTI and GIT infections','Pediatric patients with AOM, UTI and GIT infections','Patients requiring convenient oral therapy'], audiences:['Pediatricians','General practitioners','Emergency physicians','Gynecologists','Pharmacists'], rtb:['Once-daily convenience where label allows','Capsule and suspension portfolio','Dar Aldawa trust and pediatric-friendly execution'], segments:[['Otitis media','Ped., GP & ER','Differentiated pediatric suspension story with convenient counseling.','Brochure / 3D video'],['UTI','Gyn., GP & ER','Clear patient-fit message for appropriate oral cefixime use.','Detail aid'],['Bacterial gastroenteritis','Ped., GP & ER','Physician-selected oral option with simple dosing communication.','Brochure'],['Pharmacy defense','Pharmacists','Protect prescription conversion and reduce counter-substitution.','RTD / counter activation']], strengths:['Established and trusted Dar Aldawa brand equity','Capsule + suspension portfolio supports adult and pediatric use','Differentiation opportunity through ease of use and pharmacy counseling'], weaknesses:['Pediatric segment penetration requires stronger account focus','Pharmacy substitution risk can dilute prescriptions','SKU-level gaps must be tracked monthly'], opportunities:['Capture outpatient and oral step-down opportunities','Strengthen suspension execution where relevant','Build pharmacist advocacy to protect dispensing'], threats:['Antimicrobial stewardship may reduce broad antibiotic use','Competitors can defend through pricing and pharmacy offers','Guideline or prescribing shifts may change cefixime use'], strategies:[['Increase the power of prescription','Build prescriber preference with concise, stewardship-aware cefixime messaging and clear patient selection.','O1/O2'],['Pharmacy Channel Optimization','Secure on-shelf availability and reduce counter-substitution at dispense.','O3'],['Leverage suspension growth opportunity','Use suspension convenience and counseling to strengthen pediatric conversion.','O1'],['Competitive Defense & Market Expansion','Track vulnerable competitor accounts and close SKU gaps quickly.','T2/O2']], csf:['Prescriber confidence in appropriate cefixime use','On-shelf availability in target pharmacies','Simple pediatric counseling and dosing clarity']},
  'Ciprodar - Qurex': {area:'ciprofloxacin fluoroquinolone antibiotic', patients:['Adults requiring physician-selected ciprofloxacin therapy','Specialist-managed infection patients','Patients requiring disciplined, appropriate use'], audiences:['Urologists','Emergency physicians','Internists','General practitioners','Pharmacists'], rtb:['Trusted ciprofloxacin heritage','Clear patient-selection focus','Dar Aldawa quality and availability'], segments:[['UTI-focused cases','Uro., GP & ER','Responsible ciprofloxacin use in clinically appropriate patients.','Detail aid'],['Specialist infections','Internal medicine & ER','Patient selection and trusted quality story.','Case discussion'],['Pharmacy conversion','Pharmacists','Availability and confidence to reduce substitution.','RTD']], strengths:['Known molecule with established prescriber familiarity','Strong fit in selected infection segments','Portfolio heritage supports trust'], weaknesses:['Stewardship sensitivity requires disciplined messaging','Substitution and price pressure may be high','Use cases must be clearly defined by country'], opportunities:['Focus on high-need specialist segments','Defend pharmacy conversion in priority accounts','Differentiate through clinical clarity'], threats:['Antimicrobial stewardship restrictions','Fluoroquinolone safety perception','Aggressive generic substitution'], strategies:[['Specialist focus','Prioritize specialists who manage appropriate ciprofloxacin cases.','O1'],['Responsible-use positioning','Keep messaging patient-selection based and stewardship-aligned.','T1'],['Pharmacy defense','Protect availability and prescription conversion.','O2'],['Competitive monitoring','Track price erosion and generic substitution.','T2']], csf:['Clear patient profile','Specialist trust','Counter-substitution control']},
  'Hairgrow': {area:'topical minoxidil hair-loss treatment', patients:['Men and women with hereditary hair loss','Early-stage thinning patients','Patients needing clear, consistent topical routine'], audiences:['Dermatologists','Pharmacists','GPs','Consumers/caregivers through compliant awareness'], rtb:['FDA-approved molecule for hereditary hair loss','Aqueous non-oily base','Clear routine and Dar Aldawa trust'], segments:[['Hereditary hair loss','Dermatologists','Evidence-based minoxidil routine with simple expectation-setting.','Detail aid'],['Pharmacy counseling','Pharmacists','Clear usage, persistence, and counseling confidence.','Pharmacist card'],['Patient awareness','Consumers','Consistency and realistic expectations for visible results.','Compliant digital content']], strengths:['Strong OTC/pharmacy relevance','Aqueous non-oily differentiation','Simple daily routine supports education'], weaknesses:['Adherence is a key barrier','Results require time and expectation-setting','Competitive OTC shelf may be crowded'], opportunities:['Use pharmacy education to improve persistence','Build dermatologist advocacy','Differentiate aqueous base and routine simplicity'], threats:['Foam/imported alternatives','Unrealistic patient expectations','Price and promotion competition'], strategies:[['Dermatology advocacy','Build expert confidence and patient-selection clarity.','O1'],['Pharmacy education','Make pharmacists confident in counseling and persistence management.','O2'],['Digital awareness','Use compliant education to build routine and brand recall.','O3'],['Adherence support','Turn usage consistency into a brand advantage.','W1']], csf:['Consistent patient education','Pharmacist recommendation confidence','Clear differentiation of aqueous base']},
  'Deplazine': {area:'SGLT2 inhibitor / dapagliflozin therapy', patients:['Type 2 diabetes patients requiring oral therapy escalation','Cardio-metabolic risk patients where appropriate','Patients needing chronic adherence support'], audiences:['Endocrinologists','Internists','Cardiologists','GPs','Pharmacists'], rtb:['Dapagliflozin molecule relevance','Chronic-care portfolio fit','Dar Aldawa access and continuity'], segments:[['T2D escalation','Endo. & internal medicine','Appropriate SGLT2 patient-fit message.','Detail aid'],['Cardio-metabolic risk','Cardio. & internal medicine','Integrated chronic-care discussion.','KOL meeting'],['Refill continuity','Pharmacists','Protect chronic adherence and refill conversion.','Pharmacy card']], strengths:['Growing chronic-care relevance','Multiple specialty entry points','Potential for long-term refill loyalty'], weaknesses:['Needs clear patient profile','Strong originator/generic competition','Access and affordability may vary'], opportunities:['Expand chronic-care KOL advocacy','Build GP/internal medicine education','Protect refills through pharmacy'], threats:['Reimbursement/access restrictions','Competitor contracting','Class safety misconceptions'], strategies:[['Specialty leadership','Prioritize endocrinology and internal medicine advocates.','O1'],['Chronic-care positioning','Link brand to long-term cardio-metabolic management.','O2'],['Pharmacy continuity','Protect refills and adherence at retail.','O3'],['Access discipline','Monitor price corridor and payer barriers.','T1']], csf:['Clear chronic-care patient fit','Specialist endorsement','Refill protection']},
  'Glunorm': {area:'DPP-4 inhibitor / vildagliptin therapy', patients:['Type 2 diabetes patients needing oral therapy','Patients requiring tolerability and simplicity','Chronic refill patients'], audiences:['Endocrinologists','Internists','GPs','Pharmacists'], rtb:['Vildagliptin familiarity','Oral chronic-care simplicity','Dar Aldawa chronic portfolio'], segments:[['T2D management','Endo. / internal medicine / GP','Simple oral DPP-4 positioning for appropriate patients.','Detail aid'],['Chronic refill','Pharmacists','Refill continuity and substitution defense.','Pharmacy card']], strengths:['Familiar molecule and easy chronic-care story','Broad GP/internal medicine reach','Refill business potential'], weaknesses:['Highly genericized class','Differentiation needs strong execution','Price pressure'], opportunities:['Win through account focus and continuity','Build portfolio link with Glunorm M','Pharmacy refill defense'], threats:['Price-led competitors','Class switching','Substitution at refill'], strategies:[['Account focus','Prioritize high-volume diabetes accounts.','O1'],['Portfolio connection','Use Glunorm/Glunorm M pathway logic.','O2'],['Refill defense','Protect chronic retail conversion.','O3'],['Price monitoring','Track generic erosion.','T1']], csf:['Account penetration','Chronic refill conversion','Portfolio clarity']},
  'Glunorm M': {area:'vildagliptin + metformin combination therapy', patients:['Type 2 diabetes patients requiring combination therapy','Patients needing simplified oral regimens','Chronic refill patients'], audiences:['Endocrinologists','Internists','GPs','Pharmacists'], rtb:['Combination convenience','Vildagliptin + metformin logic','Dar Aldawa chronic-care continuity'], segments:[['Combination therapy','Endo. / internal medicine / GP','Simplified combination logic for appropriate patients.','Detail aid'],['Refill continuity','Pharmacists','Protect chronic regimen continuity.','Pharmacy card']], strengths:['Combination therapy relevance','Convenience story','Chronic-care refill opportunity'], weaknesses:['Crowded diabetes combination market','Differentiation and access pressure','Requires clear dosing/SKU execution'], opportunities:['Build combination step-up pathway','Use pharmacy continuity','Link to broader diabetes portfolio'], threats:['Price-led metformin combinations','Originator/generic pressure','Substitution'], strategies:[['Step-up positioning','Clarify patient-fit for combination therapy.','O1'],['Portfolio logic','Connect Glunorm and Glunorm M pathway.','O2'],['Pharmacy continuity','Protect refills.','O3'],['Competitive defense','Monitor price corridor.','T1']], csf:['Clear step-up story','SKU availability','Refill protection']},
  'Rozzita': {area:'rosuvastatin statin therapy', patients:['Dyslipidemia patients','Cardiovascular risk patients','Chronic refill patients'], audiences:['Cardiologists','Internists','GPs','Pharmacists'], rtb:['Rosuvastatin clinical familiarity','Chronic CV prevention relevance','Dar Aldawa quality and continuity'], segments:[['Dyslipidemia','Cardio. / internal medicine / GP','Strong statin fit for CV risk management.','Detail aid'],['Refill defense','Pharmacists','Chronic continuity and substitution control.','Pharmacy card']], strengths:['High chronic-care relevance','Broad prescriber base','Long-term refill potential'], weaknesses:['Highly competitive generic statin market','Price pressure','Refill substitution risk'], opportunities:['Build CV portfolio trust','Win high-volume GP/internal medicine accounts','Protect refills at pharmacy'], threats:['Price erosion','Switching within statins','Pharmacy substitution'], strategies:[['CV account focus','Prioritize cardiology and high-volume chronic accounts.','O1'],['Risk-based positioning','Connect brand to long-term CV prevention.','O2'],['Refill protection','Secure pharmacy continuity.','O3'],['Competitive defense','Track price and availability gaps.','T1']], csf:['CV account penetration','Price/access discipline','Refill conversion']},
  'Gizlan': {area:'irbesartan antihypertensive portfolio', patients:['Hypertension patients needing ARB therapy','Patients requiring combination escalation','Chronic refill patients'], audiences:['Cardiologists','Internists','GPs','Pharmacists'], rtb:['ARB portfolio breadth','Combination escalation logic','Chronic-care continuity'], segments:[['Hypertension initiation','Cardio. / internal medicine / GP','Trusted ARB option with chronic-control focus.','Detail aid'],['Combination escalation','Cardio. / internal medicine','Portfolio breadth across irbesartan combinations.','Patient profile'],['Refill continuity','Pharmacists','Protect long-term refills and minimize switching.','Pharmacy activation']], strengths:['Portfolio covers ARB and combination needs','Cardiovascular chronic-care fit','Account loyalty across strengths'], weaknesses:['Crowded antihypertensive market','Requires strong differentiation versus other ARBs','Refill substitution risk'], opportunities:['Win through portfolio breadth','Build specialist + GP continuity','Protect refills at pharmacy level'], threats:['Price-led ARB competition','Switching between antihypertensive classes','Pharmacy substitution'], strategies:[['Portfolio positioning','Use ARB and combination breadth to match patient needs.','S1'],['Chronic-account focus','Build loyalty in high-volume CV accounts.','O1'],['Refill protection','Secure pharmacy continuity for long-term patients.','O2'],['Competitive defense','Track ARB competitor movement and price offers.','T1']], csf:['Portfolio breadth clarity','Chronic prescriber loyalty','Refill conversion']},
  'Matador': {area:'levofloxacin fluoroquinolone antibiotic', patients:['Adults with physician-selected infection cases','Specialist-managed respiratory/infection cases','Patients requiring disciplined appropriate use'], audiences:['Pulmonologists','Internists','Emergency physicians','GPs','Pharmacists'], rtb:['Levofloxacin familiarity','Pulmonary and specialist relevance','Strong heritage positioning'], segments:[['Respiratory infections','Pulmonology / internal medicine / ER','Responsible levofloxacin positioning for selected patients.','Detail aid'],['High-need infection cases','Specialists / ER','Confidence, patient selection, and Dar Aldawa reliability.','Case discussion'],['Pharmacy conversion','Pharmacists','Availability and substitution defense.','RTD']], strengths:['Recognized molecule in specialist infection management','Potential pulmonary segment association','Strong fit for focused HCP engagement'], weaknesses:['Fluoroquinolone safety and stewardship sensitivity','Need to define appropriate patient profile','Substitution and price pressure'], opportunities:['Strengthen specialist advocacy','Focus on high-value pulmonary/internal medicine accounts','Protect pharmacy conversion'], threats:['Stewardship restrictions','Competitor offers and generics','Prescribing shift to alternatives'], strategies:[['Specialist leadership','Strengthen pulmonology/internal medicine advocacy.','O1'],['Responsible-use message','Keep patient selection clear and stewardship-aware.','T1'],['Pharmacy defense','Protect dispense and availability.','O2'],['Market monitoring','Track shifts from fluoroquinolones to alternatives.','T2']], csf:['Specialist endorsement','Responsible-use clarity','Pharmacy availability']},
  'Clavodar': {area:'amoxicillin + clavulanic acid antibiotic', patients:['Adults and children where amoxiclav is physician-selected','Routine outpatient infection patients','Patients requiring broad-spectrum penicillin option'], audiences:['GPs','Pediatricians','ENT physicians','Emergency physicians','Pharmacists'], rtb:['Amoxiclav molecule familiarity','Broad routine infection relevance','Dar Aldawa reliability and pharmacy focus'], segments:[['Routine outpatient infections','GP / ER','Reliable amoxiclav option with clear patient-fit message.','Detail aid'],['Pediatric infections','Pediatricians','Suspension-focused confidence and counseling where relevant.','Brochure'],['Pharmacy conversion','Pharmacists','Availability and price-confidence to reduce substitution.','RTD']], strengths:['Highly familiar first-line antibiotic class','Broad prescriber base across GP, pediatric, ENT, ER','Pharmacy channel can strongly influence conversion'], weaknesses:['Heavy price competition','High substitution risk','Requires strong SKU and availability discipline'], opportunities:['Win routine-infection accounts through availability and trust','Strengthen pediatric/pharmacy counseling','Defend against price-led competitors'], threats:['Aggressive competitor price erosion','Substitution at pharmacy','Prescribing shifts and stewardship pressure'], strategies:[['Routine-care dominance','Build preference in GP, pediatric and ER accounts.','O1'],['Pharmacy conversion','Secure shelf and reduce substitution through account offers and confidence.','O2'],['Pediatric execution','Strengthen suspension counseling and caregiver acceptance.','O3'],['Price corridor defense','Monitor affordability and competitor erosion.','T1']], csf:['Broad prescriber reach','Price and availability discipline','Pharmacy conversion']}
};


const BRAND_COMPETITORS = {
  'Mixif - Murex': [
    {name:'Cefix', positioning:'Strong cefixime retail competitor; defend through availability, trust, and SKU focus.'},
    {name:'Suprax', positioning:'Originator-equity cefixime competitor; compete through Dar Aldawa trust, field focus, and pharmacy conversion.'},
    {name:'Magnacef', positioning:'Local cephalosporin competitor; defend pediatric and retail accounts.'},
    {name:'Betixim', positioning:'Price and pharmacy-driven cefixime competitor; protect counter-substitution.'}
  ],
  'Ciprodar - Qurex': [
    {name:'Ciprobay', positioning:'Originator-equity ciprofloxacin competitor; compete through trusted local availability and account focus.'},
    {name:'Ciproxin', positioning:'Established ciprofloxacin competitor; defend specialist and retail conversion.'},
    {name:'Ciprofar', positioning:'Generic ciprofloxacin competitor; monitor price and substitution pressure.'},
    {name:'Cipromax', positioning:'Retail substitution competitor; protect pharmacy confidence and availability.'}
  ],
  'Hairgrow': [
    {name:'Rogaine', positioning:'Global minoxidil reference brand; compete through aqueous base, local trust, and pharmacist counseling.'},
    {name:'Regaine', positioning:'Premium minoxidil competitor; defend through usage simplicity and consistency education.'},
    {name:'Kirkland Minoxidil', positioning:'Price-led imported alternative; compete through availability, counseling, and local confidence.'},
    {name:'Generic Minoxidil', positioning:'OTC shelf competitor; differentiate through clear routine and Dar Aldawa quality.'}
  ],
  'Deplazine': [
    {name:'Forxiga', positioning:'Reference dapagliflozin brand; compete through access, chronic-care continuity, and specialist focus.'},
    {name:'Dapagliflozin generics', positioning:'Price-led SGLT2 competitors; defend through account penetration and refill continuity.'},
    {name:'Jardiance', positioning:'SGLT2 class competitor; compete through patient-fit clarity and specialty engagement.'},
    {name:'Invokana', positioning:'Class competitor where available; monitor switching and access pressure.'}
  ],
  'Glunorm': [
    {name:'Galvus', positioning:'Reference vildagliptin brand; compete through Dar Aldawa access and chronic refill confidence.'},
    {name:'Vildagliptin generics', positioning:'Generic DPP-4 competitors; defend through pharmacy continuity and price corridor.'},
    {name:'Januvia', positioning:'DPP-4 class competitor; compete through patient-fit and account coverage.'},
    {name:'Trajenta', positioning:'DPP-4 class competitor; monitor specialist preference and payer access.'}
  ],
  'Glunorm M': [
    {name:'Galvus Met', positioning:'Reference vildagliptin/metformin combination; compete through regimen continuity and access.'},
    {name:'Vildagliptin/Metformin generics', positioning:'Price-led combination competitors; defend with pharmacy refill continuity.'},
    {name:'Janumet', positioning:'DPP-4/metformin class competitor; compete through account targeting and patient-fit clarity.'},
    {name:'Kombiglyze', positioning:'Combination class competitor; monitor access and switching.'}
  ],
  'Rozzita': [
    {name:'Crestor', positioning:'Reference rosuvastatin brand; compete through chronic-care trust and refill continuity.'},
    {name:'Rosuvastatin generics', positioning:'Price-led statin competitors; defend through availability and account focus.'},
    {name:'Lipitor', positioning:'Statin class competitor; compete through LDL-control positioning and patient fit.'},
    {name:'Atorvastatin generics', positioning:'High-volume class alternatives; monitor switching and pricing pressure.'}
  ],
  'Gizlan': [
    {name:'Aprovel', positioning:'Reference irbesartan brand; compete through local availability and chronic-care continuity.'},
    {name:'CoAprovel', positioning:'Irbesartan/HCT competitor; defend combination segment and refill conversion.'},
    {name:'Exforge', positioning:'ARB/CCB class competitor; compete through portfolio fit and account targeting.'},
    {name:'Irbesartan generics', positioning:'Generic ARB competitors; monitor substitution and price pressure.'}
  ],
  'Matador': [
    {name:'Tavanic', positioning:'Reference levofloxacin brand; compete through specialist confidence and availability.'},
    {name:'Levofloxacin generics', positioning:'Price-led fluoroquinolone competitors; defend through patient selection and pharmacy conversion.'},
    {name:'Cravit', positioning:'Established levofloxacin competitor; monitor pulmonary and internal medicine accounts.'},
    {name:'Levox', positioning:'Retail competitor; protect prescription conversion and account supply.'}
  ],
  'Clavodar': [
    {name:'Augmentin', positioning:'Reference amoxicillin/clavulanate brand; compete through access, availability, and trust.'},
    {name:'Amoclan', positioning:'Local amoxiclav competitor; defend pediatric and GP accounts.'},
    {name:'Curam', positioning:'Amoxiclav competitor; monitor price and pharmacy switching.'},
    {name:'Amoxiclav generics', positioning:'Price-led substitution competitors; protect retail conversion and SKU availability.'}
  ]
};

const app = document.getElementById('app');
let config = { products:{...BASE_PRODUCTS}, managers:{...BASE_MANAGERS}, users:{...BASE_USERS} };
let cloudIQVIA = { data:{}, sources:[] };
let unsubscribeOverrides = null;
let state = { user:null, manager:null, isAdmin:false, country:'JO', product:'Mixif - Murex', slideIndex:0, editMode:false, overrides:{}, firebaseReady:false, cloudStatus:'Waiting for login...', openCats:{'Setup':true,'Market Analysis':true}, presentMode:false };

init();
document.addEventListener('keydown', (e)=>{ if(!state.user) return; if(e.key==='ArrowRight') goSlide(1); if(e.key==='ArrowLeft') goSlide(-1); if(e.key==='Escape' && state.presentMode){ state.presentMode=false; render(); } });
function init(){
  loadLocal();
  renderLogin();
  onAuthStateChanged(auth, async (firebaseUser)=>{
    if(!firebaseUser){
      state.user=null; state.manager=null; state.isAdmin=false; state.firebaseReady=false; state.cloudStatus='Waiting for login...';
      if(unsubscribeOverrides){ unsubscribeOverrides(); unsubscribeOverrides=null; }
      renderLogin();
      return;
    }
    await finalizeFirebaseLogin(firebaseUser);
  });
}
async function finalizeFirebaseLogin(firebaseUser){
  const email = String(firebaseUser.email||'').toLowerCase();
  state.cloudStatus='Authenticated. Loading Firebase data...';
  state.user={ email, name:(BASE_USERS[email]?.name || email) };
  state.isAdmin = email === ADMIN_EMAIL || BASE_USERS[email]?.role === 'admin';
  state.manager = state.isAdmin ? 'Admin' : (BASE_USERS[email]?.name || email);
  renderLogin();
  try {
    await loadCloudConfig();
    const u = config.users[email] || BASE_USERS[email];
    if(!u){
      await signOut(auth);
      alert('This Firebase account is authenticated but not allowed inside the Marketing Plan system. Ask Admin to add it from the Admin Panel.');
      return;
    }
    state.user={ email, name:u.name };
    state.isAdmin = email === ADMIN_EMAIL || u.role === 'admin';
    state.manager = state.isAdmin ? 'Admin' : u.name;
    state.product = (state.isAdmin ? Object.keys(config.products)[0] : (config.managers[u.name]||[])[0]) || Object.keys(config.products)[0];
    listenOverrides();
    await loadCloudDataManifest();
    state.firebaseReady=true;
    state.cloudStatus='Firebase connected';
    toast('Firebase connected');
  } catch(e){
    state.firebaseReady=false;
    state.cloudStatus='Login OK, but Firebase data loading failed. Check Firestore rules.';
    console.warn(e);
  }
  render();
}
function loadLocal(){
  try{ const c = JSON.parse(localStorage.getItem('mpb_config_v5')||'{}'); config = mergeConfig(c); }
  catch{ config = mergeConfig({}); }
  try{ state.overrides = JSON.parse(localStorage.getItem('mpb_overrides_v5')||'{}'); }catch{}
}
function mergeConfig(c){ return { products:{...BASE_PRODUCTS, ...(c.products||{})}, managers:{...BASE_MANAGERS, ...(c.managers||{})}, users:{...BASE_USERS, ...(c.users||{})} }; }
async function loadCloudConfig(){
  const snap = await getDoc(doc(db,'marketingPlan','config'));
  if(snap.exists()){ config = mergeConfig(snap.data()); localStorage.setItem('mpb_config_v5', JSON.stringify(snap.data())); }
  else { await setDoc(doc(db,'marketingPlan','config'), { products:{}, managers:{}, users:{}, updatedAt:serverTimestamp() }, { merge:true }); }
}
async function saveCloudConfig(){
  const custom = diffCustomConfig(); localStorage.setItem('mpb_config_v5', JSON.stringify(custom));
  await setDoc(doc(db,'marketingPlan','config'), { ...custom, updatedAt:serverTimestamp(), updatedBy:state.user?.email || 'admin' }, { merge:true });
  config = mergeConfig(custom); render(); toast('Saved to Firebase');
}
function diffCustomConfig(){
  const products={}, managers={}, users={};
  Object.entries(config.products).forEach(([k,v])=>{ if(!BASE_PRODUCTS[k] || JSON.stringify(BASE_PRODUCTS[k])!==JSON.stringify(v)) products[k]=v; });
  Object.entries(config.managers).forEach(([k,v])=>{ if(!BASE_MANAGERS[k] || JSON.stringify(BASE_MANAGERS[k])!==JSON.stringify(v)) managers[k]=v; });
  Object.entries(config.users).forEach(([k,v])=>{ if(!BASE_USERS[k] || JSON.stringify(BASE_USERS[k])!==JSON.stringify(v)) users[k]=v; });
  return { products, managers, users };
}
function listenOverrides(){
  if(unsubscribeOverrides) unsubscribeOverrides();
  unsubscribeOverrides = onSnapshot(collection(db,'slideOverrides'), snap=>{
    snap.forEach(d=>{ const x=d.data(); if(x.key && x.html) state.overrides[x.key]=x.html; });
    localStorage.setItem('mpb_overrides_v5', JSON.stringify(state.overrides));
    if(state.user) renderSlidesOnly();
  }, err=>console.warn(err));
}
async function loadCloudDataManifest(){
  const snap = await getDoc(doc(db,'marketingPlan','dataManifest'));
  if(!snap.exists()) return;
  const manifest = snap.data().files || [];
  cloudIQVIA = { data:{}, sources:[] };
  for(const f of manifest){
    try{
      let rows=[];
      if(f.mode === 'firestoreChunks'){
        rows = await loadFirestoreChunkRows(f);
      } else if(f.url){
        const res = await fetch(f.url);
        const json = await res.json();
        rows = json.rows || [];
      }
      cloudIQVIA.data[f.country] ||= {};
      cloudIQVIA.data[f.country][f.period] = { rows };
      cloudIQVIA.sources.push(f);
    }
    catch(e){ console.warn('data file failed',f,e); }
  }
}
async function loadFirestoreChunkRows(fileInfo){
  const dataId = fileInfo.dataId || `${fileInfo.country}_${fileInfo.period}`;
  const snap = await getDocs(collection(db,'iqviaData',dataId,'chunks'));
  const chunks=[];
  snap.forEach(d=>chunks.push(d.data()));
  chunks.sort((a,b)=>(a.index||0)-(b.index||0));
  return chunks.flatMap(c=>unpackStoredRows(c.rows || c.rowsMap || []));
}
function unpackStoredRows(stored){
  if(Array.isArray(stored)){
    return stored.map(r=>{
      if(Array.isArray(r)) return r;
      if(r && Array.isArray(r.v)) return r.v;
      if(r && Array.isArray(r.values)) return r.values;
      return r;
    });
  }
  return Object.keys(stored||{}).sort().map(k=>stored[k]);
}

function esc(s){return String(s??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));}
function fmt(n){return Math.round(Number(n)||0).toLocaleString('en-US');}
function pct(x){return isFinite(x)?`${Math.round(x*100)}%`:'0%';}
function growth(cy,py){py=Number(py)||0;cy=Number(cy)||0;return py?(cy-py)/py:0;}
function rowObj(arr){const o={}; SCHEMA.forEach((k,i)=>o[k]=arr[i]); return o;}
let ALL_DATA_CACHE=null, ALL_DATA_CACHE_KEY='';
function allData(){
  const key = `${Object.keys(cloudIQVIA.data||{}).join('|')}__${cloudIQVIA.sources?.length||0}`;
  if(ALL_DATA_CACHE && ALL_DATA_CACHE_KEY===key) return ALL_DATA_CACHE;
  const base = window.IQVIA_DATA || {data:{},sources:[]};
  const out = { data:{...base.data}, sources:[...(base.sources||[])] };
  Object.entries(cloudIQVIA.data||{}).forEach(([country,periods])=>{
    out.data[country] = {...(out.data[country]||{}), ...periods};
  });
  out.sources = [...out.sources, ...(cloudIQVIA.sources||[])];
  ALL_DATA_CACHE_KEY=key; ALL_DATA_CACHE=out;
  return out;
}
const DATA_CACHE = new Map();
function dataRows(country,period){
  const p=allData().data?.[country]?.[period];
  if(!p) return [];
  const key = `${country}_${period}_${p.rows?.length||0}_${cloudIQVIA.sources?.length||0}`;
  if(DATA_CACHE.has(key)) return DATA_CACHE.get(key);
  const rows = (p.rows||[]).map(r=>Array.isArray(r)?rowObj(r):r);
  DATA_CACHE.set(key, rows);
  if(DATA_CACHE.size > 16) DATA_CACHE.delete(DATA_CACHE.keys().next().value);
  return rows;
}
function hasData(){ return dataRows(state.country,'MAT').length || dataRows(state.country,'YTD').length; }
function norm(s){return String(s||'').toUpperCase().replace(/HCTZ/g,'HYDROCHLOROTHIAZIDE').replace(/HCT\b/g,'HYDROCHLOROTHIAZIDE').replace(/CLAVULANATE/g,'CLAVULANIC ACID').replace(/\s+/g,' ').trim();}
function molTokens(s){return norm(s).split(/[!+\/,&]/).map(x=>x.trim()).filter(Boolean).sort();}
function sameMolecule(mol,group){const a=molTokens(mol), b=group.map(norm).sort(); return a.length===b.length && a.every((x,i)=>x===b[i]);}
function productDef(){return config.products[state.product] || Object.values(config.products)[0];}
function matchesMol(r,pd=productDef()){return (pd.moleculeGroups||[]).some(g=>sameMolecule(r.molecule,g));}
function blob(r){return [r.product,r.companyBrand,r.brandName,r.sku,r.manufacturer].join(' ').toUpperCase();}
function matchesBrand(r,pd=productDef()){return (pd.brandKeywords||[]).some(k=>blob(r).includes(norm(k)));}
function sum(rows,key){return rows.reduce((s,r)=>s+(Number(r[key])||0),0)}
function aggregate(rows,keyFn){const m=new Map();rows.forEach(r=>{const k=keyFn(r)||'Undefined'; const x=m.get(k)||{name:k,py1Usd:0,cyUsd:0,py1Unit:0,cyUnit:0,py2Usd:0,py2Unit:0,rows:[]}; ['py1Usd','cyUsd','py1Unit','cyUnit','py2Usd','py2Unit'].forEach(f=>x[f]+=Number(r[f])||0); x.rows.push(r); m.set(k,x);}); return [...m.values()];}
function rank(items,key){return [...items].sort((a,b)=>(Number(b[key])||0)-(Number(a[key])||0)).reduce((m,x,i)=>(m.set(x.name,i+1),m),new Map());}
function common(rows,key){const m=new Map();rows.forEach(r=>{const v=r[key]; if(v) m.set(v,(m.get(v)||0)+1)}); return [...m.entries()].sort((a,b)=>b[1]-a[1])[0]?.[0]||'';}
function hierarchy(){const mat=dataRows(state.country,'MAT'); const mol=mat.filter(r=>matchesMol(r)); const brand=mol.filter(r=>matchesBrand(r)); const pool=brand.length?brand:(mol.length?mol:mat); return {atc1:common(pool,'atc1'),atc2:common(pool,'atc2'),atc3:common(pool,'atc3'),atc4:common(pool,'atc4'),molecule:common(pool,'molecule')};}
function country(){return COUNTRIES[state.country]||COUNTRIES.JO}
function cp(){return COUNTRY_PLAYBOOK[state.country]||COUNTRY_PLAYBOOK.JO}
function bp(){return BRAND[state.product]||BRAND['Mixif - Murex']}
function countryStyle(){const c=country();return `--flagA:${c.flagColors[0]};--flagB:${c.flagColors[1]};--flagC:${c.flagColors[2]};`;}
function allowedProducts(){return state.isAdmin ? Object.keys(config.products) : (config.managers[state.manager] || []);}
function slideKey(i){return `${state.country}__${state.product}__${i}`.replace(/[^a-z0-9_\-]/gi,'_');}


function render(){ if(!state.user) return renderLogin(); renderApp(); }
function renderLogin(){
  const remembered = localStorage.getItem('mpb_remember_login') === 'true';
  const rememberedUser = remembered ? (localStorage.getItem('mpb_login_username') || '') : '';
  app.innerHTML = `
  <div class="login ultra-login">
    <div class="login-card login-card-minimal">
      <div class="login-glow"></div>
      <div class="brand-kicker"><span class="brand-mark"></span>Dar Aldawa Marketing Planning System</div>
      <h1>Marketing Plan Builder</h1>
      <p class="muted login-subtitle">Enter your username and password to continue.</p>

      <form id="loginForm" class="login-form" autocomplete="on">
        <div class="field">
          <label>Username</label>
          <input id="loginEmail" name="username" placeholder="Admin, Azhar, Abdallah, Isam or email" value="${esc(rememberedUser)}" autocomplete="username">
        </div>

        <div class="field password-field">
          <label>Password</label>
          <div class="password-wrap">
            <input id="loginPass" name="password" type="password" placeholder="password" autocomplete="current-password">
            <button type="button" id="togglePassword" class="show-pass-btn">Show</button>
          </div>
        </div>

        <div class="login-options">
          <label class="check-row">
            <input type="checkbox" id="rememberMe" ${remembered ? 'checked' : ''}>
            <span>Remember me</span>
          </label>
          <label class="check-row">
            <input type="checkbox" id="showPasswordCheck">
            <span>Show password</span>
          </label>
        </div>

        <button class="primary login-submit" id="loginBtn" type="submit">Log in</button>
        <div id="loginStatusBox" class="login-status-box">${esc(state.cloudStatus)}</div>
      </form>
    </div>
  </div>`;

  const form = document.getElementById('loginForm');
  const emailInput = document.getElementById('loginEmail');
  const passInput = document.getElementById('loginPass');
  const remember = document.getElementById('rememberMe');
  const showPasswordCheck = document.getElementById('showPasswordCheck');
  const togglePassword = document.getElementById('togglePassword');

  function applyPasswordVisibility(show){
    passInput.type = show ? 'text' : 'password';
    showPasswordCheck.checked = show;
    togglePassword.textContent = show ? 'Hide' : 'Show';
  }

  showPasswordCheck.addEventListener('change', e => applyPasswordVisibility(e.target.checked));
  togglePassword.addEventListener('click', () => applyPasswordVisibility(passInput.type === 'password'));

  form.addEventListener('submit', (e)=>{
    e.preventDefault();
    const username = emailInput.value.trim();
    if(remember.checked){
      localStorage.setItem('mpb_remember_login','true');
      localStorage.setItem('mpb_login_username', username);
    } else {
      localStorage.removeItem('mpb_remember_login');
      localStorage.removeItem('mpb_login_username');
    }
    doLogin(username, passInput.value, remember.checked);
  });

  setTimeout(()=> (rememberedUser ? passInput : emailInput).focus(), 40);
}
async function doLogin(id,pass,remember=false){
  const raw=String(id||'').trim();
  const aliasMap = {
    'admin': ADMIN_EMAIL,
    'azhar': 'azhar.said@dadgroup.com',
    'azhar said': 'azhar.said@dadgroup.com',
    'abdallah': 'abdallah.nasser@dadgroup.com',
    'abdallah nasser': 'abdallah.nasser@dadgroup.com',
    'isam': 'isam.aljundi@dadgroup.com',
    'isam aljundi': 'isam.aljundi@dadgroup.com'
  };
  const email=(aliasMap[raw.toLowerCase()] || raw).toLowerCase();
  const btn=document.getElementById('loginBtn');
  const status=document.getElementById('loginStatusBox');

  function setLoginStatus(msg,type='info'){
    state.cloudStatus=msg;
    if(status){
      status.textContent=msg;
      status.className='login-status-box '+type;
    }
  }

  if(!email || !pass){
    setLoginStatus('Enter username and password.','error');
    return;
  }

  try{
    if(btn){ btn.disabled=true; btn.textContent='Signing in...'; }
    setLoginStatus('Signing in with Firebase Authentication...');
    await setPersistence(auth, remember ? browserLocalPersistence : browserSessionPersistence);

    const loginPromise = signInWithEmailAndPassword(auth,email,pass);
    const timeoutPromise = new Promise((_,reject)=>setTimeout(()=>reject(new Error('Login timeout. Check internet connection, Firebase Authentication setup, and browser console errors.')), 15000));
    await Promise.race([loginPromise, timeoutPromise]);

    setLoginStatus('Login successful. Loading system...');
  } catch(e){
    console.warn(e);
    if(btn){ btn.disabled=false; btn.textContent='Log in'; }
    const msg=authErrorMessage(e);
    setLoginStatus(msg,'error');
    alert(msg);
  }
}
function authErrorMessage(e){
  const code=String(e?.code||'');
  const msg=String(e?.message||'');
  if(msg.includes('Login timeout')) return msg;
  if(code.includes('operation-not-allowed')) return 'Email/Password sign-in is not enabled in Firebase Authentication.';
  if(code.includes('user-not-found') || code.includes('invalid-credential')) return 'Login failed. Check username/password and make sure this user exists in Firebase Authentication.';
  if(code.includes('wrong-password')) return 'Wrong password.';
  if(code.includes('too-many-requests')) return 'Too many attempts. Wait a few minutes and try again.';
  if(code.includes('network-request-failed')) return 'Network error. Check internet connection and Firebase access.';
  return 'Login failed. Check Authentication setup, user password, and browser console.';
}
function renderApp(){
  const c=country(); const products=allowedProducts(); if(!products.includes(state.product)) state.product=products[0]||Object.keys(config.products)[0];
  const models=slideModels(); if(state.slideIndex>=models.length) state.slideIndex=0;
  app.innerHTML = `<div class="shell ${state.presentMode?'present-shell':''}" style="${countryStyle()}"><aside class="sidebar"><div class="side-logo"><span class="brand-mark"></span><div><b>Marketing Plan 2026</b><div class="small">${esc(state.user.name)} • ${state.isAdmin?'Admin':'PM'}</div></div></div><div class="side-section"><div class="side-section-title">Selection</div><div class="selectors"><select id="countrySelect">${Object.entries(COUNTRIES).map(([k,v])=>`<option value="${k}" ${k===state.country?'selected':''}>${v.flag} ${k} — ${v.label}</option>`).join('')}</select><select id="productSelect">${products.map(p=>`<option ${p===state.product?'selected':''}>${esc(p)}</option>`).join('')}</select></div></div><div class="side-section"><div class="side-section-title">Deck navigator</div><div id="slideNav"></div></div><div class="side-section"><button class="ghost" id="logoutBtn">Logout</button></div></aside><main class="main"><div class="country-ribbon"></div><div class="topbar"><div class="top-title"><div class="title-line"><span class="flag-badge">${c.flag}</span><div><b>${esc(state.product)} (${esc(productDef().ingredient)})</b><small>${esc(c.label)} • ${esc(cp().channel)} • ${esc(state.cloudStatus)}</small></div></div></div><div class="btn-row"><span class="status-pill live-chip">${hasData()?'Live data ready':'Data pending'}</span>${state.isAdmin?'<button class="secondary" id="adminBtn">Admin Panel</button>':''}</div></div><div class="stage"><div class="toolbar"><button class="ghost" id="prevSlide">‹ Previous</button><span class="slide-counter" id="slideCounter"></span><button class="ghost" id="nextSlide">Next ›</button><button class="primary" id="downloadPpt">Download dashboard-exact PowerPoint</button><button class="ghost" id="editSlide">${state.editMode?'Editing enabled':'Edit current slide'}</button><button class="secondary" id="saveSlide">Save current slide</button><button class="danger" id="resetSlide">Reset current slide</button><button class="ghost" id="presentBtn">${state.presentMode?'Exit presentation':'Presentation mode'}</button></div><div id="slides"></div></div></main></div>`;
  document.getElementById('countrySelect').onchange=e=>{state.country=e.target.value;state.slideIndex=0;state.editMode=false;render();};
  document.getElementById('productSelect').onchange=e=>{state.product=e.target.value;state.slideIndex=0;state.editMode=false;render();};
  document.getElementById('logoutBtn').onclick=()=>signOut(auth);
  document.getElementById('adminBtn')?.addEventListener('click',renderAdmin);
  document.getElementById('downloadPpt').onclick=downloadPpt;
  document.getElementById('editSlide').onclick=()=>{state.editMode=!state.editMode; renderSlidesOnly();};
  document.getElementById('saveSlide').onclick=saveCurrentSlide;
  document.getElementById('resetSlide').onclick=resetCurrentSlide;
  document.getElementById('presentBtn').onclick=()=>{state.presentMode=!state.presentMode; render();};
  document.getElementById('prevSlide').onclick=()=>goSlide(-1);
  document.getElementById('nextSlide').onclick=()=>goSlide(1);
  renderSlidesOnly();
}
function goSlide(delta){ const models=slideModels(); state.slideIndex=Math.max(0,Math.min(models.length-1,state.slideIndex+delta)); state.editMode=false; renderSlidesOnly(); }

function safeModelHtml(model){
  try{
    return modelHtml(model);
  }catch(e){
    console.error('Slide render failed:', model?.title, e);
    return `<div class="empty-slide"><div class="empty-box"><h2 class="slide-title">Slide loading issue</h2><p>${esc(e?.message||String(e))}</p><p>This slide was isolated so the rest of the deck remains working.</p></div></div>`;
  }
}
function modelHtml(model){ return model?.html || (typeof model?.htmlFn==='function' ? model.htmlFn() : ''); }

function renderSlidesOnly(){
  if(!state.user || !document.getElementById('slides')) return;
  const models=slideModels();
  renderNav(models);

  if(state.slideIndex < 0) state.slideIndex = 0;
  if(state.slideIndex >= models.length) state.slideIndex = models.length - 1;

  const s=models[state.slideIndex] || models[0];
  let generatedHtml='';
  try{
    generatedHtml = safeModelHtml(s);
  }catch(e){
    console.error('Slide render failed', e, s);
    generatedHtml = `<div class="empty-slide"><div class="empty-box"><h2 class="slide-title">Slide loading issue</h2><p>${esc(e?.message||String(e))}</p><p>Please send the console error so this slide can be fixed.</p></div></div>`;
  }

  document.getElementById('slideCounter').textContent=`Slide ${state.slideIndex+1} / ${models.length}`;
  const slides=document.getElementById('slides');
  slides.innerHTML=`<section class="slide ${s.cls||''} ${state.editMode?'editable-on':''}" id="slide-${state.slideIndex}"><div class="flag-strip"></div><div class="slide-header-flag"><span>${country().flag}</span><b>${esc(state.country)}</b></div><div class="slide-watermark">Dar Aldawa • Years of Excellence</div><div class="slide-no">${state.slideIndex+1}</div><div class="slide-body" data-key="${slideKey(state.slideIndex)}">${state.overrides[slideKey(state.slideIndex)]||generatedHtml}</div></section>`;
  if(state.editMode) enableEdit();
}
function renderNav(models){
  const nav=document.getElementById('slideNav');
  if(!nav) return;

  const groups=[];
  models.forEach((s,i)=>{
    let cat=groups.find(x=>x.cat===s.cat);
    if(!cat){ cat={cat:s.cat,subs:[]}; groups.push(cat); }
    const subName=s.sub||s.title;
    let sub=cat.subs.find(x=>x.name===subName);
    if(!sub){ sub={name:subName,items:[]}; cat.subs.push(sub); }
    sub.items.push({s,i});
  });

  nav.innerHTML=groups.map(g=>{
    const catOpen=state.openCats[g.cat]!==false;
    return `<div class="nav-accordion">
      <button type="button" class="nav-cat ${catOpen?'open':''}" data-cat="${esc(g.cat)}">
        <span>${esc(g.cat)}</span><b>${catOpen?'−':'+'}</b>
      </button>
      <div class="nav-cat-body ${catOpen?'open':''}">
        ${g.subs.map(sub=>{
          const key=`${g.cat}__${sub.name}`;
          const subOpen=state.openSubs?.[key]!==false;
          return `<div class="nav-sub-group">
            <button type="button" class="nav-sub ${subOpen?'open':''}" data-subkey="${esc(key)}">
              <span>${esc(sub.name)}</span><b>${subOpen?'−':'+'}</b>
            </button>
            <div class="nav-sub-body ${subOpen?'open':''}">
              ${sub.items.map(({s,i})=>`<button type="button" class="nav-item ${i===state.slideIndex?'active':''}" data-i="${i}">
                <span class="dot"></span>
                <span class="nav-label"><b>${i+1}. ${esc(s.title)}</b><small>${esc(s.note||'')}</small></span>
              </button>`).join('')}
            </div>
          </div>`;
        }).join('')}
      </div>
    </div>`;
  }).join('');

  nav.querySelectorAll('.nav-cat').forEach(b=>{
    b.addEventListener('click',(e)=>{
      e.preventDefault();
      const cat=b.dataset.cat;
      state.openCats[cat]=!(state.openCats[cat]!==false);
      renderNav(models);
    });
  });

  nav.querySelectorAll('.nav-sub').forEach(b=>{
    b.addEventListener('click',(e)=>{
      e.preventDefault();
      e.stopPropagation();
      state.openSubs ||= {};
      const key=b.dataset.subkey;
      state.openSubs[key]=!(state.openSubs[key]!==false);
      renderNav(models);
    });
  });

  nav.querySelectorAll('.nav-item').forEach(b=>{
    b.addEventListener('click',(e)=>{
      e.preventDefault();
      e.stopPropagation();
      const idx=Number(b.dataset.i);
      if(Number.isFinite(idx)){
        state.slideIndex=idx;
        state.editMode=false;
        renderSlidesOnly();
        document.getElementById('slides')?.scrollIntoView({behavior:'smooth',block:'start'});
      }
    });
  });
}
function enableEdit(){ const slide=document.getElementById(`slide-${state.slideIndex}`); slide?.querySelectorAll('h1,h2,h3,p,li,td,th,.comments-box,.comment-text,.card,.empty-box,.pill,.editable-text').forEach(el=>el.setAttribute('contenteditable','true')); }
async function saveCurrentSlide(){ const body=document.querySelector(`#slide-${state.slideIndex} .slide-body`); if(!body) return; const key=slideKey(state.slideIndex); state.overrides[key]=body.innerHTML; localStorage.setItem('mpb_overrides_v5',JSON.stringify(state.overrides)); try{ await setDoc(doc(db,'slideOverrides',key), { key, html:body.innerHTML, country:state.country, product:state.product, slide:state.slideIndex, updatedBy:state.user.email, updatedAt:serverTimestamp() }, { merge:true }); toast('Slide saved to Firebase'); }catch(e){ console.warn(e); toast('Saved locally; Firebase write failed'); } }
async function resetCurrentSlide(){ const key=slideKey(state.slideIndex); delete state.overrides[key]; localStorage.setItem('mpb_overrides_v5',JSON.stringify(state.overrides)); try{ await setDoc(doc(db,'slideOverrides',key), { key, html:'', deleted:true, updatedAt:serverTimestamp() }, { merge:true }); }catch{} renderSlidesOnly(); }


const BRAND_DEEP = {
  'Mixif - Murex': {
    essence:'Eternal Trust in oral cefixime — built on pediatric usability, once-daily convenience, and retail conversion defense.',
    winningMove:'Make Mixif the most confidently prescribed and most reliably dispensed cefixime brand by owning pediatric suspension, protecting pharmacy conversion, and converting competitor pressure into account-level actions.',
    battlefield:'Cefix, Suprax, Betixim, Magnacef and the fragmented cefixime tail. The battle is not only clinical; it is a retail conversion battle where trust, availability, taste, syringe usability, and pharmacist loyalty determine whether the prescription remains Mixif.',
    watchouts:['Cefix leads the cefixime field and must be attacked selectively by account and segment.','Suprax carries originator/reference equity and should be countered through Dar Aldawa trust and availability.','Betixim and Magnacef are substitution threats; pharmacy education and SKU availability are critical.','Others indicate fragmentation and an opportunity to consolidate share if Mixif improves visibility and counter conversion.'],
    swot:{
      strengths:['Unique and friendly dosing syringe that improves ease of use versus many cefixime competitors.','Superior palatability and pediatric acceptance story versus key suspension alternatives.','Well-established Dar Aldawa brand equity and trust with HCPs and pharmacists.','Full capsule + suspension portfolio supports adult and pediatric use.'],
      weaknesses:['Account penetration is still not deep enough in selected high-volume pediatric and GP accounts.','Mixif pediatric segment share is below the opportunity implied by suspension relevance.','Counter-substitution risk remains high when pharmacy loyalty is not actively managed.','The 60 ml opportunity requires sharper visibility, counseling, and availability tracking.'],
      opportunities:['The pediatric segment presents a clear growth opportunity, especially where suspension convenience matters.','Current momentum can be converted into additional market share through focused account attack.','Pharmacist education can improve Mixif 30 ml and suspension conversion.','Competitor fragmentation creates room to consolidate the cefixime tail.'],
      threats:['Cefixime may face pressure from guideline shifts and stewardship behavior.','Competitors can defend through aggressive price and pharmacy offers.','Bacterial gastroenteritis positioning requires careful, appropriate patient selection.','Retail substitution can happen even when prescriptions are written for Mixif.']
    },
    csf:['On-shelf availability in priority pharmacies — if absent, immediate counter-substitution will occur.','Trust and loyalty from HCPs and pharmacists — without trust, prescriptions are not Mixif-written; without pharmacist loyalty, counter switches happen even when the Rx is for Mixif.','Pediatric execution excellence: syringe, taste, dosing clarity, and caregiver confidence.','Named competitor defense against Cefix, Suprax, Betixim, Magnacef, and Others.'],
    shapeIntro:'Mixif should use market shape to identify where the cefixime market actually converts: suspension vs capsule, strength mix, pack size, and pediatric fit. If Mixif’s SKU mix does not mirror the profitable conversion zones, the brand plan should correct focus, visibility, and availability.',
    positioning:'For patients requiring an appropriate, convenient oral cephalosporin, Mixif provides a trusted cefixime solution backed by Dar Aldawa reliability, pediatric-friendly suspension execution, and once-daily convenience where appropriate. Unlike fragmented cefixime alternatives, Mixif connects prescription confidence with pharmacy conversion through portfolio breadth, dosing simplicity, and strong local brand trust.',
    core:'Lead the cefixime market by making Mixif the first-choice brand for prescribers and pharmacists through stronger prescription initiation, sharper pediatric suspension ownership, pharmacy conversion defense, and account-by-account competitor attack.'
  }
};

const BRAND_DEEP_EXT = {
  'Ciprodar - Qurex': {
    essence:'The Power of Trusted Heritage in ciprofloxacin — disciplined patient selection, specialist confidence, and retail conversion defense.',
    winningMove:'Make Ciprodar - Qurex the responsible, trusted ciprofloxacin choice for selected infection cases by owning specialist confidence and protecting dispense conversion.',
    battlefield:'Ciprobay, Ciproxin, Ciprofar, Cipromax and generic ciprofloxacin pressure. The battle is shaped by stewardship sensitivity, fluoroquinolone perception, and pharmacy substitution.',
    watchouts:['Responsible-use message must be clear; broad antibiotic claims can weaken trust.','Originator-equity competitors should be countered through Dar Aldawa reliability and availability.','Pharmacy substitution risk is high where price pressure dominates.','Specialist accounts must be prioritized over broad unfocused coverage.'],
    swot:{strengths:['Known ciprofloxacin molecule with strong prescriber familiarity.','Dar Aldawa heritage supports confidence and availability.','Fit with urology, ER, internal medicine and selected infection segments.','Portfolio presence supports retail trust.'],weaknesses:['Stewardship sensitivity requires disciplined messaging.','Safety perception can affect fluoroquinolone preference.','High substitution risk at pharmacy level.','Need sharper patient profile by specialty and country.'],opportunities:['Build specialist-led confidence in appropriate cases.','Defend high-value UTI and ER accounts.','Use pharmacy education to reduce counter-switching.','Monitor vulnerable competitor accounts and attack selectively.'],threats:['Antimicrobial stewardship restrictions.','Fluoroquinolone class safety concerns.','Aggressive generic substitution and pricing pressure.','Shifts toward alternative antibiotics.']},
    csf:['Responsible-use patient profile','Specialist trust and endorsement','Pharmacy availability and counter-substitution control','Named competitor monitoring'],
    shapeIntro:'Ciprodar - Qurex market shape should identify which strengths, packs and formulations are driving ciprofloxacin conversion and whether the brand is over- or under-exposed to the highest-value retail SKUs.',
    positioning:'For selected adult infection patients where ciprofloxacin is clinically appropriate, Ciprodar - Qurex offers a trusted Dar Aldawa ciprofloxacin option built on heritage, reliability, and disciplined patient selection.',
    core:'Grow Ciprodar - Qurex by focusing on appropriate-use segments, specialist confidence, and pharmacy conversion defense against named ciprofloxacin competitors.'
  },
  'Hairgrow': {
    essence:'Clear, simple hair confidence — a topical minoxidil brand built around adherence, aqueous non-oily differentiation, and pharmacist-led routine education.',
    winningMove:'Make Hairgrow the most recommended local minoxidil routine by owning simple usage, persistence education, and pharmacy counseling confidence.',
    battlefield:'Rogaine, Regaine, Kirkland Minoxidil and generic minoxidil alternatives. The battle is fought on routine adherence, texture preference, credibility, expectation-setting, and shelf recommendation.',
    watchouts:['Adherence is the real growth barrier; patients stop before results.','Imported brands may carry reference-brand perception.','Price-led alternatives can win if counseling is weak.','Unrealistic expectations can damage repeat usage.'],
    swot:{strengths:['Aqueous non-oily base supports a clear differentiation story.','Minoxidil is a recognized molecule for hereditary hair loss.','Strong pharmacy relevance and OTC counseling potential.','Simple routine can be converted into loyalty.'],weaknesses:['Results require time and persistence.','Patient expectations must be managed carefully.','Shelf competition can be crowded.','Digital communication must remain compliant and educational.'],opportunities:['Pharmacist education can improve persistence and recommendation.','Dermatologist advocacy can raise confidence.','Digital awareness can reinforce consistent use.','Aqueous base can differentiate versus oily alternatives.'],threats:['Foam and imported alternatives.','Price promotions from generic minoxidil.','Low adherence and early discontinuation.','Unrealistic before/after expectations.']},
    csf:['Pharmacist counseling confidence','Dermatology advocacy','Adherence and expectation-setting','Clear aqueous-base differentiation'],
    shapeIntro:'Hairgrow market shape should reveal where minoxidil sales come from: 2% vs 5%, pack size, gender relevance, and routine preference. The plan should connect SKU mix to adherence and recommendation behavior.',
    positioning:'For men and women experiencing hereditary hair loss, Hairgrow is the clear, simple Dar Aldawa minoxidil routine that supports consistency, confidence, and pharmacist-guided usage.',
    core:'Grow Hairgrow by making adherence the strategic battlefield: educate pharmacists, activate dermatologists, and make aqueous simplicity the main reason to recommend and repeat.'
  },
  'Deplazine': {
    essence:'A chronic cardio-metabolic growth brand built on dapagliflozin patient fit, specialist confidence, and long-term refill continuity.',
    winningMove:'Make Deplazine a focused chronic-care growth engine by targeting high-potential T2D/cardio-metabolic accounts and protecting refill conversion.',
    battlefield:'Forxiga, Jardiance, generic dapagliflozin and SGLT2 alternatives. The battle is driven by specialist confidence, access, chronic continuity, and payer/price pressure.',
    watchouts:['Reference-brand equity remains strong.','Access and affordability can shape uptake.','Patient profile must be clear to avoid unfocused promotion.','Refill continuity is critical for chronic value capture.'],
    swot:{strengths:['Dapagliflozin relevance in chronic cardio-metabolic care.','Multiple specialty entry points: endocrinology, internal medicine and cardiology.','Long-term refill potential.','Dar Aldawa chronic portfolio fit.'],weaknesses:['Strong originator and generic competition.','Patient selection story requires precision.','Access can vary by account/channel.','Field teams need strong chronic-care message discipline.'],opportunities:['Build specialist advocacy in high-value accounts.','Use pharmacy continuity to protect refills.','Expand GP/internal medicine education.','Leverage chronic portfolio cross-selling.'],threats:['Competitor contracting and access barriers.','Price-led generics.','Class misconceptions and safety concerns.','Switching within SGLT2 class.']},
    csf:['Clear chronic-care patient fit','Specialist endorsement','Access discipline','Refill conversion protection'],
    shapeIntro:'Deplazine market shape should show how dapagliflozin conversion is distributed across strengths and packs, then identify whether the brand is aligned to chronic refill behavior.',
    positioning:'For appropriate T2D/cardio-metabolic patients, Deplazine is a Dar Aldawa dapagliflozin option built around chronic-care continuity, access discipline, and specialist confidence.',
    core:'Grow Deplazine by prioritizing specialist-led chronic accounts, protecting refill continuity, and defending against SGLT2 competitor pressure.'
  },
  'Glunorm': {
    essence:'A practical DPP-4 chronic-care brand built on vildagliptin familiarity, oral simplicity, and refill continuity.',
    winningMove:'Make Glunorm the dependable vildagliptin option in high-volume diabetes accounts through account penetration, pharmacy refill protection, and portfolio clarity.',
    battlefield:'Galvus, vildagliptin generics, Januvia and Trajenta. The battle is shaped by price pressure, genericization, prescriber habit, and chronic refill substitution.',
    watchouts:['Differentiation is difficult in a genericized DPP-4 class.','Price pressure can erode preference.','Pharmacy substitution can happen at refill.','Portfolio logic must be clear between Glunorm and Glunorm M.'],
    swot:{strengths:['Familiar vildagliptin molecule.','Simple oral chronic-care story.','Broad GP/internal medicine relevance.','Potential refill loyalty.'],weaknesses:['Crowded genericized class.','Differentiation needs strong execution.','Price pressure.','Refill substitution risk.'],opportunities:['Win high-volume diabetes accounts.','Build Glunorm / Glunorm M pathway logic.','Use pharmacy continuity to defend refills.','Target accounts where DPP-4 use remains stable.'],threats:['Price-led competitors.','Switching within diabetes classes.','Pharmacy substitution.','Reduced class focus if newer therapies dominate.']},
    csf:['Account penetration','Chronic refill conversion','Portfolio clarity','Price and availability discipline'],
    shapeIntro:'Glunorm market shape should show which strengths/packs drive chronic refills and whether the portfolio supports continuity at the pharmacy.',
    positioning:'For T2D patients needing a simple oral DPP-4 option, Glunorm offers a dependable Dar Aldawa vildagliptin brand with chronic refill and portfolio continuity.',
    core:'Grow Glunorm by focusing on high-volume diabetes accounts, strengthening refill protection, and clarifying the Glunorm/Glunorm M treatment pathway.'
  },
  'Glunorm M': {
    essence:'A combination diabetes brand built around step-up convenience, regimen continuity, and vildagliptin + metformin logic.',
    winningMove:'Make Glunorm M the practical combination choice by owning step-up patients, simplifying regimen communication, and protecting chronic refills.',
    battlefield:'Galvus Met, vildagliptin/metformin generics, Janumet and other DPP-4/metformin combinations. The battle is driven by convenience, price, access and refill continuity.',
    watchouts:['Combination market is crowded.','Patient step-up story must be simple.','SKU availability is critical for continuity.','Price-led competitors can win at refill.'],
    swot:{strengths:['Combination therapy relevance.','Convenience story for appropriate patients.','Connection to Glunorm portfolio.','Long-term refill opportunity.'],weaknesses:['Crowded combination market.','Access and price pressure.','Requires clear dosing/SKU execution.','Differentiation needs strong account focus.'],opportunities:['Build combination step-up pathway.','Use pharmacy continuity to protect regimen adherence.','Link with broader diabetes portfolio.','Win GP/internal medicine accounts.'],threats:['Originator/generic pressure.','Price-led metformin combinations.','Substitution at refill.','Switching to alternative diabetes classes.']},
    csf:['Clear step-up story','SKU availability','Refill continuity','Portfolio pathway clarity'],
    shapeIntro:'Glunorm M market shape should reveal which combinations and strengths drive repeat therapy and where SKU continuity can protect chronic value.',
    positioning:'For T2D patients requiring combination therapy, Glunorm M provides a practical Dar Aldawa vildagliptin + metformin option that supports regimen continuity and step-up simplicity.',
    core:'Grow Glunorm M by owning the step-up combination segment, protecting refill continuity, and linking the brand to a clear diabetes portfolio pathway.'
  },
  'Rozzita': {
    essence:'A chronic cardiovascular prevention brand built around rosuvastatin confidence, risk-based targeting, and refill defense.',
    winningMove:'Make Rozzita a trusted rosuvastatin choice in high-value CV accounts by owning LDL-control confidence and protecting long-term refills.',
    battlefield:'Crestor, rosuvastatin generics, Lipitor and atorvastatin alternatives. The battle is shaped by chronic trust, price pressure, statin switching, and pharmacy refill behavior.',
    watchouts:['Statin market is highly competitive and genericized.','Price pressure can dominate if value story is weak.','Refill substitution can erode chronic share.','CV account prioritization must be disciplined.'],
    swot:{strengths:['Rosuvastatin clinical familiarity.','High chronic-care relevance.','Broad cardiology/internal medicine/GP base.','Long-term refill potential.'],weaknesses:['Highly competitive statin market.','Price pressure.','Need sharper differentiation versus atorvastatin and rosuvastatin generics.','Refill substitution risk.'],opportunities:['Build CV portfolio trust.','Win high-volume chronic accounts.','Protect pharmacy refills.','Use risk-based positioning.'],threats:['Price erosion.','Switching within statins.','Pharmacy substitution.','Competitor contracting.']},
    csf:['CV account penetration','Risk-based positioning clarity','Refill conversion','Price/access discipline'],
    shapeIntro:'Rozzita market shape should identify the strengths and packs that drive chronic statin refills and whether Rozzita is present in the right conversion zones.',
    positioning:'For dyslipidemia and CV-risk patients, Rozzita is the Dar Aldawa rosuvastatin brand that supports LDL-control confidence, chronic continuity, and refill protection.',
    core:'Grow Rozzita by prioritizing high-volume CV accounts, using risk-based positioning, and defending long-term retail refills.'
  },
  'Gizlan': {
    essence:'An ARB portfolio brand built around hypertension continuity, combination escalation, and chronic refill loyalty.',
    winningMove:'Make Gizlan the practical irbesartan portfolio choice by matching patient needs across ARB and combination escalation while protecting chronic refills.',
    battlefield:'Aprovel, CoAprovel, Exforge and irbesartan/ARB generics. The battle is shaped by portfolio breadth, chronic loyalty, price pressure, and pharmacy substitution.',
    watchouts:['ARB market is crowded.','Portfolio breadth must be communicated clearly.','Combination escalation opportunity requires precise targeting.','Substitution risk remains high in chronic refills.'],
    swot:{strengths:['ARB and combination portfolio breadth.','Hypertension chronic-care fit.','Combination escalation logic.','Potential account loyalty across strengths.'],weaknesses:['Crowded antihypertensive market.','Need stronger differentiation versus other ARBs.','Refill substitution risk.','Portfolio complexity can dilute message.'],opportunities:['Win through portfolio breadth.','Build cardiology/GP chronic loyalty.','Use pharmacy continuity to protect refills.','Target escalation patients.'],threats:['Price-led ARB competition.','Switching between antihypertensive classes.','Pharmacy substitution.','Competitor portfolio pressure.']},
    csf:['Portfolio breadth clarity','Chronic prescriber loyalty','Refill conversion','Escalation-pathway communication'],
    shapeIntro:'Gizlan market shape should show whether demand sits in mono-therapy, HCT combination or amlodipine combination and whether the portfolio is aligned to escalation behavior.',
    positioning:'For hypertension patients needing ARB therapy or combination escalation, Gizlan provides a Dar Aldawa irbesartan portfolio that supports continuity, flexibility, and chronic refill confidence.',
    core:'Grow Gizlan by using portfolio breadth as the strategic advantage: win initiation, guide escalation, and protect chronic refill conversion.'
  },
  'Matador': {
    essence:'A specialist infection brand built on levofloxacin confidence, pulmonary relevance, and responsible-use discipline.',
    winningMove:'Make Matador the preferred levofloxacin option in specialist-managed cases by owning pulmonary/internal medicine confidence and defending pharmacy conversion.',
    battlefield:'Tavanic, Cravit, levofloxacin generics and retail substitution competitors. The battle is shaped by specialist confidence, stewardship caution, and price-driven switching.',
    watchouts:['Fluoroquinolone stewardship and safety perception must be handled carefully.','Specialist focus is more valuable than broad coverage.','Retail substitution can dilute prescriptions.','Competitor offers can quickly shift pharmacy behavior.'],
    swot:{strengths:['Recognized levofloxacin molecule.','Pulmonary and specialist relevance.','Strong fit for focused HCP engagement.','Dar Aldawa reliability and availability.'],weaknesses:['Stewardship and safety sensitivity.','Need clearly defined patient profile.','Substitution and price pressure.','Potential market shift to alternatives.'],opportunities:['Strengthen pulmonology/internal medicine advocacy.','Focus on high-value infection accounts.','Protect pharmacy conversion.','Track shifts from fluoroquinolones to alternatives.'],threats:['Stewardship restrictions.','Competitor offers and generics.','Prescribing shifts to alternatives.','Safety perception.']},
    csf:['Specialist endorsement','Responsible-use clarity','Pharmacy availability','Pulmonary account focus'],
    shapeIntro:'Matador market shape should identify which levofloxacin strengths/packs drive specialist and retail conversion and whether the brand is aligned to the highest-value infection segments.',
    positioning:'For selected infection cases requiring levofloxacin, Matador is the Dar Aldawa brand that combines specialist confidence, responsible patient selection, and retail availability.',
    core:'Grow Matador by leading specialist confidence in selected cases, maintaining stewardship-aware messaging, and defending pharmacy conversion.'
  },
  'Clavodar': {
    essence:'A routine-infection workhorse brand built on amoxiclav familiarity, availability, and pediatric/GP pharmacy conversion.',
    winningMove:'Make Clavodar the dependable amoxicillin/clavulanate choice in routine infection accounts by owning availability, pharmacy confidence, and pediatric/GP reach.',
    battlefield:'Augmentin, Amoclan, Curam and amoxiclav generics. The battle is price, availability, pediatric confidence, and pharmacy substitution.',
    watchouts:['Augmentin has reference-brand equity.','Price-led competitors can win at the counter.','SKU availability is critical in routine infections.','Pediatric suspension counseling can influence caregiver acceptance.'],
    swot:{strengths:['Highly familiar amoxiclav class.','Broad GP, pediatric, ENT and ER prescriber base.','Pharmacy channel can strongly influence conversion.','Dar Aldawa trust and availability.'],weaknesses:['Heavy price competition.','High substitution risk.','Requires strong SKU and availability discipline.','Differentiation can be hard in routine infections.'],opportunities:['Win routine-infection accounts through availability and trust.','Strengthen pediatric/pharmacy counseling.','Defend against price-led competitors.','Use field focus to consolidate high-volume accounts.'],threats:['Aggressive competitor price erosion.','Substitution at pharmacy.','Prescribing shifts and stewardship pressure.','Stock gaps create immediate switching.']},
    csf:['Broad prescriber reach','Price and availability discipline','Pharmacy conversion','Pediatric counseling confidence'],
    shapeIntro:'Clavodar market shape should show which strengths, packs and suspension formats drive routine infection conversion and where SKU availability can protect the brand.',
    positioning:'For adults and children where amoxiclav is physician-selected, Clavodar provides a dependable Dar Aldawa amoxicillin/clavulanate option built on availability, trust, and pharmacy confidence.',
    core:'Grow Clavodar by winning routine-care accounts, defending pharmacy conversion, and maintaining strict SKU availability discipline.'
  }
};
Object.assign(BRAND_DEEP, BRAND_DEEP_EXT);

function deep(){
  const base=BRAND_DEEP[state.product];
  if(base) return base;
  const comps=topCompetitors(4).map(x=>x.name).join(', ') || 'priority competitors';
  return {
    essence:`A focused Dar Aldawa brand plan for ${state.product}, built around patient fit, customer trust, availability, and competitor-specific execution.`,
    winningMove:`Make ${state.product} the preferred ${productDef().ingredient} brand in ${country().label} by winning the right segments, protecting retail conversion, and defending against ${comps}.`,
    battlefield:`${state.product} competes against ${comps}. The winning plan should define who can take prescriptions, who can win at pharmacy level, and which accounts require immediate defense.`,
    watchouts:[`Separate market pressure from brand execution gaps.`,`Use IQVIA monthly updates to identify at-risk competitors and accounts.`,`Convert broad positioning into segment-specific messages.`,`Protect pharmacy conversion and availability.`],
    swot:{strengths:bp().strengths, weaknesses:bp().weaknesses, opportunities:bp().opportunities, threats:bp().threats},
    csf:[...bp().csf, 'Named competitor defense discipline', 'Monthly IQVIA-based action updates'],
    shapeIntro:`Market shape should show how ${productDef().ingredient} sales are distributed across SKUs, strengths, dosage forms, and packs, then compare whether ${state.product} is aligned with the conversion zones.`,
    positioning:`For ${bp().patients[0]}, ${state.product} is the Dar Aldawa ${productDef().ingredient} option that differentiates through patient fit, execution reliability, and stronger conversion support versus ${comps}.`,
    core:`Grow ${state.product} by focusing resources on the highest-conversion segments, strengthening prescriber confidence, and protecting the dispensing outcome against ${comps}.`
  };
}
function brandBattlefieldHtml(){
  const d=deep(); const comps=topCompetitors(5).map(x=>x.name);
  return `<h2 class="slide-title">Brand battlefield</h2>
  <div class="battlefield-layout">
    <div class="battle-hero">
      <span class="battle-kicker">Winning move</span>
      <h3>${esc(d.winningMove)}</h3>
      <p>${esc(d.essence)}</p>
    </div>
    <div class="battle-side">
      <div class="battle-card"><b>Competitive battlefield</b><p>${esc(d.battlefield)}</p></div>
      <div class="battle-chip-wrap">${comps.map(c=>`<span>${esc(c)}</span>`).join('')}</div>
    </div>
  </div>
  <div class="watchout-grid">${d.watchouts.map((x,i)=>`<div><span>Watch ${i+1}</span><p>${esc(x)}</p></div>`).join('')}</div>`;
}
function strategicImperativesHtml(){
  const d=deep();
  const rows=[
    ['1','Win prescription initiation',`Make ${state.product} the default choice in selected patient segments through sharper patient-fit messaging, stronger call quality, and focused KOL/account engagement.`,'Prescription share'],
    ['2','Defend pharmacy conversion','Turn pharmacy from a passive channel into a conversion battlefield: availability, pharmacist confidence, substitution monitoring, and rapid correction of stock gaps.','Dispense protection'],
    ['3','Attack named competitors',`Build competitor-specific actions against ${topCompetitors(4).map(x=>x.name).join(', ') || 'priority competitors'} instead of broad unfocused coverage.`,'Competitive share capture'],
    ['4','Use IQVIA monthly discipline','Every monthly update should result in a decision: defend, attack, reallocate, or stop.','Execution agility']
  ];
  return `<h2 class="slide-title">Strategic imperatives</h2><div class="imperative-banner">${esc(d.core)}</div>${table(['#','Strategic Imperative','Detailed execution meaning','Success signal'],rows,'imperative-table')}`;
}

function slideModels(){
  if(!hasData()) return [
    {cat:'Setup',sub:'Opening',title:'Cover',cls:'cover',htmlFn:coverHtml},
    {cat:'Market Analysis',sub:'Data',title:'Data pending',htmlFn:()=>blankHtml('Data pending','Upload the monthly IQVIA MAT/YTD Excel bundle from Admin Center to generate the full Marketing Plan.')}
  ];
  return [
    {cat:'Setup',sub:'Opening',title:'Cover',cls:'cover',htmlFn:coverHtml},
    {cat:'Setup',sub:'Opening',title:'Brand / Country',cls:'brand-title',htmlFn:brandCountryHtml},
    {cat:'Setup',sub:'Opening',title:'Brand battlefield',htmlFn:brandBattlefieldHtml},
    {cat:'Setup',sub:'Opening',title:'Executive Summary',htmlFn:executiveSummaryHtml},
    {cat:'Market Analysis',sub:'Section divider',title:'Market Analysis',htmlFn:()=>sectionHtml('Market Analysis','')},
    {cat:'Market Analysis',sub:'USD MAT pathway',title:'Market Analysis – USD - MAT',note:'ATC1',htmlFn:()=>marketHtml('ATC1','atc1')},
    {cat:'Market Analysis',sub:'USD MAT pathway',title:'Market Analysis Sales Analysis – USD - MAT',note:'ATC1 / ATC2',htmlFn:()=>marketHtml('ATC1 / ATC2','atc2')},
    {cat:'Market Analysis',sub:'USD MAT pathway',title:'Market Analysis Sales Analysis – USD - MAT',note:'ATC2 / ATC3',htmlFn:()=>marketHtml('ATC2 / ATC3','atc3')},
    {cat:'Market Analysis',sub:'USD MAT pathway',title:'Market Analysis Sales Analysis – USD - MAT',note:'ATC3 / ATC4',htmlFn:()=>marketHtml('ATC3 / ATC4','atc4')},
    {cat:'Market Analysis',sub:'USD MAT pathway',title:'Market Analysis Sales Analysis – USD - MAT',note:'Molecule',htmlFn:()=>marketHtml('Molecule','molecule')},
    {cat:'Market Analysis',sub:'Product performance',title:'Market Analysis Sales Analysis – Units/Value - MAT',note:'Molecule / Product',htmlFn:()=>productHtml('MAT')},
    {cat:'Market Analysis',sub:'Product performance',title:'Market Analysis Sales Analysis – Units/Value - YTD',note:'Molecule / Product',htmlFn:()=>productHtml('YTD')},
    {cat:'Market Analysis',sub:'Market shape',title:'Market Shape - Units',htmlFn:()=>shapeHtml('Units')},
    {cat:'Market Analysis',sub:'Market shape',title:'Market Shape - Value',htmlFn:()=>shapeHtml('Value')},
    {cat:'Market Analysis',sub:'Market trend',title:'Market Trend',htmlFn:trendHtml},
    {cat:'Environment',sub:'Manual planning',title:'Products Prices',htmlFn:productsPricesHtml},
    {cat:'Environment',sub:'Manual planning',title:'Key Competitors Profile',htmlFn:competitorsHtml},
    {cat:'Environment',sub:'Healthcare',title:'Healthcare structure',htmlFn:healthcareHtml},
    {cat:'Environment',sub:'Customer chain',title:'Customers chain analysis',htmlFn:chainHtml},
    {cat:'Environment',sub:'Brand diagnosis',title:'SWOT analysis',htmlFn:swotHtml},
    {cat:'Environment',sub:'Brand diagnosis',title:'Critical Success Factor',htmlFn:csfHtml},
    {cat:'Strategies & Tactics',sub:'Section divider',title:'Strategies and tactics',htmlFn:()=>sectionHtml('Strategies and tactics','')},
    {cat:'Strategies & Tactics',sub:'Strategy',title:'Strategic imperatives',htmlFn:strategicImperativesHtml},
    {cat:'Strategies & Tactics',sub:'Objectives',title:'Strategic objectives',htmlFn:objectivesHtml},
    {cat:'Strategies & Tactics',sub:'Positioning',title:'Positioning',htmlFn:positioningHtml},
    {cat:'Strategies & Tactics',sub:'Segmentation',title:'Targeting, segmentation and messages',htmlFn:targetingHtml},
    {cat:'Strategies & Tactics',sub:'Segmentation',title:'Targeting, segmentation and messages – platform',htmlFn:targetingGeneralHtml},
    {cat:'Strategies & Tactics',sub:'Strategy',title:'Core marketing strategy',htmlFn:coreStrategyHtml},
    {cat:'Strategies & Tactics',sub:'Strategy',title:'Supportive strategies',htmlFn:supportiveHtml},
    {cat:'Strategies & Tactics',sub:'Manual planning',title:'Actions based on strategies',htmlFn:actionsHtml},
    {cat:'Strategies & Tactics',sub:'Manual planning',title:'Plan timeline',htmlFn:timelineHtml},
    {cat:'Strategies & Tactics',sub:'Manual planning',title:'Main events',htmlFn:mainEventsHtml},
    {cat:'Financials',sub:'Section divider',title:'Financials',htmlFn:()=>sectionHtml('Financials','')},
    {cat:'Financials',sub:'Manual planning',title:'Sales forecast – SKU',htmlFn:salesForecastSkuHtml},
    {cat:'Financials',sub:'Manual planning',title:'Sales forecast total - Value',htmlFn:salesForecastTotalHtml},
    {cat:'Financials',sub:'Manual planning',title:'Overall expenses',htmlFn:expensesHtml},
    {cat:'Financials',sub:'Manual planning',title:'FTEs',htmlFn:()=>blankHtml('FTEs','')},
    {cat:'Closing',sub:'Closing',title:'Thank you',htmlFn:()=>sectionHtml('Thank you','')}
  ];
}


function coverHtml(){
  return `<div class="hero-card">
    <div class="flag-head"><span class="flag-badge large">${country().flag}</span><div><div class="badge">Dar Aldawa • ${esc(country().label)}</div></div></div>
    <h1>Marketing Plan 2026</h1>
    <div class="cover-brand">${esc(state.product)} <span class="ingredient-inline">(${esc(productDef().ingredient)})</span></div>
    <div class="cover-country">Prepared by: ${esc(preparedByName())}</div>
    ${kpiStrip()}
  </div>`;
}
function brandCountryHtml(){
  return `<div class="brand-country-layout"><div>
    <div class="flag-head"><span class="flag-badge large">${country().flag}</span><div class="badge">${esc(country().label)} • Dar Aldawa</div></div>
    <h1>${esc(state.product)}</h1>
    <div class="cover-brand">${esc(productDef().ingredient)}</div>
    <div class="cover-country">${esc(country().label)}</div>
    <div class="brand-subnote">${esc(bp().area)} • country plan focused on ${esc(cp().channel)}</div>
  </div></div>`;
}
function sectionHtml(t,sub){
  return `<div class="empty-slide"><div><h2 class="slide-title section-title">${esc(t)}</h2>${sub?`<p class="slide-subtitle">${esc(sub)}</p>`:''}</div></div>`;
}
function blankHtml(t,n){
  return `<div class="empty-slide"><div class="empty-box"><h2 class="slide-title">${esc(t)}</h2>${n?`<p>${esc(n)}</p>`:''}</div></div>`;
}
function executiveSummaryHtml(){
  const m=brandMetrics('YTD');
  const share=m.moleculeValue?pct(m.brandValue/m.moleculeValue):'0%';
  const vision=`Make ${state.product} the preferred Dar Aldawa choice within ${bp().area} in ${country().label} by combining precise targeting, message discipline, and conversion excellence across retail and specialist-led channels.`;
  const forecast=(growth(m.brandValue,m.brandValuePy)>=0?`Aim for disciplined 2026 growth by building on the current YTD run-rate while defending priority accounts.`:`Reset growth in 2026 by protecting the base business, recovering vulnerable accounts, and reallocating effort toward the highest-conversion segments.`);
  return `<h2 class="slide-title">Executive Summary</h2>${kpiStrip()}<div class="summary-template rich-summary">
    <div class="summary-card"><h3>Overall vision</h3><p>${esc(vision)}</p></div>
    <div class="summary-card"><h3>Prioritised Opportunities</h3><ul>${bp().opportunities.slice(0,3).map(x=>`<li>${esc(x)}</li>`).join('')}</ul></div>
    <div class="summary-card"><h3>Strategic Drivers</h3><ul><li>${esc(cp().execution)}</li><li>Therapeutic focus: ${esc(hierarchy().atc2 || bp().area)}</li><li>Country access lens: ${esc(cp().access)}</li></ul></div>
    <div class="summary-card"><h3>Sales forecast 2026</h3><p>${esc(forecast)}</p></div>
    <div class="summary-card"><h3>Market Analysis</h3><p>The plan should translate market structure into a clear action agenda: where to defend, where to grow, and where to stop spreading effort.</p></div>
    <div class="summary-card"><h3>Brand Positioning</h3><p>${esc(state.product)} should be positioned as a trusted, execution-led option with clear conversion support at prescribing and dispensing level.</p></div>
    <div class="summary-card"><h3>Core Brand Strategy</h3><p>${esc(bp().strategies[0]?.[1] || '')}</p></div>
    <div class="summary-card"><h3>Prioritised Patient Populations</h3><ul>${bp().patients.map(x=>`<li>${esc(x)}</li>`).join('')}</ul><p class="micro-note">Current YTD molecule share contribution: <b>${share}</b>.</p></div>
  </div>`;
}
function definitionsHtml(){
  return `<h2 class="slide-title">Definitions</h2><div class="definition-matrix">
    <div class="def-box"><h3>Product definition</h3><p>A clear description of ${esc(state.product)}, specifying active ingredient, formulation, dosage form, strength, and country-relevant indications.</p><p><b>Current product:</b> ${esc(productDef().ingredient)}.</p></div>
    <div class="def-box"><h3>Market definition (defined)</h3><p>A structured framework outlining the competitive environment for ${esc(productDef().ingredient)}, including competitors, therapeutic classes, and key market segments. It provides the basis for assessing market potential.</p></div>
    <div class="def-box"><h3>Market shape</h3><p>The sales contribution and distribution across different SKUs, formulations, dosage forms, strengths, and packs. It shows where the market is actually converted.</p></div>
    <div class="def-box"><h3>Market trend</h3><p>The general direction and pattern of market changes, reflecting shifts in guidelines, demand, competition, prescribing behavior, pricing, product innovation, and regulatory dynamics.</p></div>
  </div>`;
}
function filteredForLevel(level){
  const mat=dataRows(state.country,'MAT');
  const h=hierarchy();
  if(level==='atc1') return mat;
  if(level==='atc2') return mat.filter(r=>r.atc1===h.atc1);
  if(level==='atc3') return mat.filter(r=>r.atc2===h.atc2);
  if(level==='atc4') return mat.filter(r=>r.atc3===h.atc3);
  if(level==='molecule') return mat.filter(r=>r.atc4===h.atc4);
  return mat;
}
function parentForLevel(level){
  const h=hierarchy();
  return level==='atc1'?'Total Market': level==='atc2'?h.atc1: level==='atc3'?h.atc2: level==='atc4'?h.atc3: h.atc4;
}
function keyForLevel(level){
  return level==='atc2'?'ATC1 / ATC2':level==='atc3'?'ATC2 / ATC3':level==='atc4'?'ATC3 / ATC4':level==='molecule'?'Molecule':'ATC1';
}


function qGrowth(g){
  if(!isFinite(g)) return 'stable';
  if(g >= .12) return 'strong growth';
  if(g >= .03) return 'moderate growth';
  if(g > -.03) return 'broad stability';
  if(g > -.12) return 'moderate decline';
  return 'sharp decline';
}
function qShareDelta(delta){
  if(!isFinite(delta)) return 'stable share';
  if(delta >= .03) return 'gaining share clearly';
  if(delta >= .01) return 'gaining share modestly';
  if(delta > -.01) return 'holding share';
  if(delta > -.03) return 'losing share modestly';
  return 'losing share clearly';
}
function qRankMove(py,cy){
  if(!py || !cy) return 'rank movement cannot be assessed';
  if(cy < py) return `improved from #${py} to #${cy}`;
  if(cy > py) return `dropped from #${py} to #${cy}`;
  return `remained at #${cy}`;
}
function smartJoin(items,limit=3){
  return (items||[]).filter(Boolean).slice(0,limit).join(', ') || 'no clear driver';
}
function aggForLevel(level, period='MAT'){
  const mat=dataRows(state.country,period);
  const h=hierarchy();
  let source=mat;
  if(level==='atc2') source=mat.filter(r=>r.atc1===h.atc1);
  if(level==='atc3') source=mat.filter(r=>r.atc2===h.atc2);
  if(level==='atc4') source=mat.filter(r=>r.atc3===h.atc3);
  if(level==='molecule') source=mat.filter(r=>r.atc4===h.atc4);
  const key = level;
  const rows=aggregate(source,r=>r[key]).filter(x=>x.name&&x.name!=='Undefined');
  return {source, rows, key};
}
function focusNameFor(level){
  const h=hierarchy();
  return level==='atc1'?h.atc1:level==='atc2'?h.atc2:level==='atc3'?h.atc3:level==='atc4'?h.atc4:h.molecule;
}
function focusStats(level,period='MAT'){
  const {source,rows}=aggForLevel(level,period);
  const focus=focusNameFor(level);
  const selected=rows.find(x=>norm(x.name)===norm(focus)) || rows.find(x=>norm(x.name).includes(norm(focus)) || norm(focus).includes(norm(x.name))) || rows[0];
  const totalCy=sum(source,'cyUsd')||1, totalPy=sum(source,'py1Usd')||1;
  const pyRank=rank(rows,'py1Usd'), cyRank=rank(rows,'cyUsd');
  const selectedGrowth=growth(selected?.cyUsd||0, selected?.py1Usd||0);
  const parentGrowth=growth(sum(source,'cyUsd'),sum(source,'py1Usd'));
  const share=(selected?.cyUsd||0)/totalCy;
  const sharePy=(selected?.py1Usd||0)/totalPy;
  const top=rows.slice().sort((a,b)=>(b.cyUsd||0)-(a.cyUsd||0)).slice(0,4);
  const growers=rows.filter(x=>(x.cyUsd||0)>0 && (x.py1Usd||0)>0)
    .sort((a,b)=>growth(b.cyUsd,b.py1Usd)-growth(a.cyUsd,a.py1Usd)).slice(0,3);
  const decliners=rows.filter(x=>(x.cyUsd||0)>0 && (x.py1Usd||0)>0)
    .sort((a,b)=>growth(a.cyUsd,a.py1Usd)-growth(b.cyUsd,b.py1Usd)).slice(0,3);
  return {
    source, rows, focus, selected, totalCy, totalPy,
    selectedGrowth, parentGrowth, share, sharePy, shareDelta:share-sharePy,
    pyRank:pyRank.get(selected?.name), cyRank:cyRank.get(selected?.name),
    top, growers, decliners
  };
}
function analysisTableNarrative(level){ return dataDrivenLevelComment(level); }
function dataDrivenLevelComment(level){
  const s=focusStats(level,'MAT');
  const c=country().label;
  const p=state.product;
  const focus=esc(s.focus || productDef().ingredient);
  const topNames=smartJoin(s.top.map(x=>x.name),4);
  const growers=smartJoin(s.growers.map(x=>x.name),3);
  const decliners=smartJoin(s.decliners.map(x=>x.name),3);
  const selectedName=esc(s.selected?.name || s.focus || '');
  const rankMove=qRankMove(s.pyRank,s.cyRank);
  const parentDirection=qGrowth(s.parentGrowth);
  const focusDirection=qGrowth(s.selectedGrowth);
  const shareDirection=qShareDelta(s.shareDelta);
  const lines = {
    atc1:{
      findings:`In ${c}, the total retail medicine market is showing ${parentDirection}. The selected therapeutic entry point for ${p} is ${focus}, which is ${focusDirection} and ${shareDirection} versus last year. The largest visible market blocks are ${topNames}.`,
      actions:`Use the total-market view to decide how much attention ${p} deserves in ${c}. If ${focus} is outperforming the market, scale priority accounts; if it is under pressure, tighten coverage around the most defensible segments.`,
      recommendations:`Treat ATC1 as a resource-allocation gate. The market context in ${c} should guide whether the brand plan is offensive, defensive, or selective before moving deeper into the class.`
    },
    atc2:{
      findings:`Inside ${focusNameFor('atc1') || 'the parent class'}, ${selectedName} is ${focusDirection} while the parent pool shows ${parentDirection}. The segment ${rankMove}, and the strongest visible peers are ${topNames}.`,
      actions:`Translate the ATC2 read into customer focus. Prioritize the accounts and specialties where ${selectedName} is still movable and where competitor pressure can be addressed by field execution.`,
      recommendations:`Do not distribute effort across the full parent class. In ${c}, ${p} should focus on ATC2 pockets where demand quality, access, and pharmacy conversion can be influenced.`
    },
    atc3:{
      findings:`Within ${focusNameFor('atc2') || 'the selected ATC2'}, ${selectedName} is the key sub-class read for ${p}. It is ${focusDirection}, ${shareDirection}, and ${rankMove}. Growth pockets are led by ${growers}, while pressure is concentrated around ${decliners}.`,
      actions:`Use this slide to select the sub-class customers that deserve attention. Map ${selectedName} to the relevant specialties, high-volume accounts, and pharmacy groups in ${c}.`,
      recommendations:`ATC3 should become the first real prioritization filter. Invest only where ${p} has a clear patient-fit story and a practical route to conversion.`
    },
    atc4:{
      findings:`At ATC4 level, ${selectedName} is the execution arena closest to the brand. It is showing ${focusDirection}, while share is ${shareDirection}. The movement suggests that prescribing form, treatment setting, and competitor activity are reshaping the opportunity in ${c}.`,
      actions:`Convert this slide into a segment action plan: identify where oral, retail, chronic, or specialist conversion is happening and link it to specific customer and SKU actions.`,
      recommendations:`ATC4 should bridge analysis and execution. Any ATC4 opportunity that cannot be linked to a target list, pharmacy action, or competitor defense should not consume major resources.`
    },
    molecule:{
      findings:`For ${p}, ${selectedName} is the direct molecule battlefield in ${c}. The molecule is ${focusDirection}, ${shareDirection}, and ${rankMove}. The key competing molecules/classes around it include ${topNames}.`,
      actions:`Use the molecule view to decide whether the brand should defend its base, attack substitutes, or reposition against changing prescribing behavior. Link the conclusion to named competitors and patient segments.`,
      recommendations:`This slide should produce the competitive diagnosis for ${p}: where the molecule still supports growth, where it is losing relevance, and where Dar Aldawa can win through sharper execution.`
    }
  };
  return lines[level] || lines.molecule;
}
function productTableNarrative(period){
  const pd=productDef();
  const {market, products, displayed}=productTableRows(period);
  const brand=products.find(x=>matchKeyword(x.name,pd.brandKeywords||[]));
  const comps=displayed.filter(x=>!x.isTotal && !x.isOthers && !matchKeyword(x.name,pd.brandKeywords||[])).slice(0,5);
  const others=displayed.find(x=>x.isOthers);
  const brandGUnit=growth(brand?.cyUnit||0, brand?.py1Unit||0);
  const brandGValue=growth(brand?.cyUsd||0, brand?.py1Usd||0);
  const totalU=sum(market,'cyUnit')||1, totalUPy=sum(market,'py1Unit')||1;
  const brandShare=(brand?.cyUnit||0)/totalU, brandSharePy=(brand?.py1Unit||0)/totalUPy;
  const compWinners=comps.filter(x=>growth(x.cyUnit,x.py1Unit)>brandGUnit).map(x=>x.name);
  const compLosers=comps.filter(x=>growth(x.cyUnit,x.py1Unit)<brandGUnit).map(x=>x.name);
  const compNames=smartJoin(comps.map(x=>x.name),5);
  const othersText=others?` The remaining tail is grouped under ${others.name}, indicating ${others.cyUnit>totalU*.25?'high':'manageable'} fragmentation.`:'';
  if(period==='MAT'){
    return {
      findings:`In ${country().label} MAT, ${state.product} is ${qGrowth(brandGUnit)} in units and ${qGrowth(brandGValue)} in value. Its unit share is ${qShareDelta(brandShare-brandSharePy)}. The most relevant competitors in the table are ${compNames}.${othersText}`,
      actions:`Use MAT as the strategic competitor read. Defend against competitors outperforming the brand (${smartJoin(compWinners,3)}) and attack weaker competitors where the brand is already gaining relative momentum (${smartJoin(compLosers,3)}).`,
      recommendations:`The annual plan for ${state.product} should not chase the whole molecule market. It should focus on the top competitor battles and define whether each competitor is an attack, defense, or monitor priority.`
    };
  }
  return {
    findings:`In ${country().label} YTD, ${state.product} shows ${qGrowth(brandGUnit)} in units and ${qGrowth(brandGValue)} in value, with share ${qShareDelta(brandShare-brandSharePy)}. YTD competitors needing close attention are ${compNames}.${othersText}`,
    actions:`Use YTD as the execution-control slide. Correct account issues immediately where competitors are moving faster (${smartJoin(compWinners,3)}), and scale the actions working against weaker competitors (${smartJoin(compLosers,3)}).`,
    recommendations:`Every monthly YTD update should trigger an action: defend an account, attack a named competitor, fix availability, or reallocate field time away from low-conversion areas.`
  };
}
function shapeNarrative(metric){
  const pd=productDef();
  const key=metric==='Units'?'cyUnit':'cyUsd';
  const all=dataRows(state.country,'YTD').filter(r=>matchesMol(r,pd));
  const brandRows=all.filter(r=>matchesBrand(r,pd));
  const marketSku=aggregate(all,r=>r.sku||r.strength||r.pack||'Unspecified').sort((a,b)=>b[key]-a[key]);
  const brandSku=aggregate(brandRows,r=>r.sku||r.strength||r.pack||'Unspecified').sort((a,b)=>b[key]-a[key]);
  const topMarket=marketSku[0]?.name || 'the leading SKU';
  const topBrand=brandSku[0]?.name || 'the leading brand SKU';
  const marketTopShare=(marketSku[0]?.[key]||0)/(sum(all,key)||1);
  const brandTopShare=(brandSku[0]?.[key]||0)/(sum(brandRows,key)||1);
  if(metric==='Units'){
    return {
      findings:`In ${country().label}, unit shape shows that ${topMarket} is the main molecule-volume driver, while ${state.product} is most dependent on ${topBrand}. The brand SKU concentration is ${brandTopShare>marketTopShare?'higher than':'lower than or similar to'} the molecule pattern.`,
      actions:`Use unit shape to fix execution by SKU: protect the brand’s main volume SKU, identify under-penetrated molecule SKUs, and connect the SKU gap to the customer/channel responsible for conversion.`,
      recommendations:`If ${state.product} is underweight in the molecule’s main unit-driving SKU, the plan should include a focused recovery action for availability, counseling, and field emphasis.`
    };
  }
  return {
    findings:`In ${country().label}, value shape shows where commercial quality is concentrated. The molecule’s leading value contributor is ${topMarket}, while ${state.product} is most value-dependent on ${topBrand}.`,
    actions:`Compare unit and value shape before setting priorities. SKUs that protect value should receive different actions than SKUs that mainly build volume.`,
    recommendations:`Use value shape to protect profitable growth. ${state.product} should not only gain units; it should improve the SKU mix that supports value, margin, and long-term portfolio quality.`
  };
}
function trendNarrative(){
  const pd=productDef();
  const matMol=dataRows(state.country,'MAT').filter(r=>matchesMol(r,pd));
  const ytdMol=dataRows(state.country,'YTD').filter(r=>matchesMol(r,pd));
  const matG=growth(sum(matMol,'cyUsd'),sum(matMol,'py1Usd'));
  const ytdG=growth(sum(ytdMol,'cyUsd'),sum(ytdMol,'py1Usd'));
  const brandYtd=ytdMol.filter(r=>matchesBrand(r,pd));
  const brandG=growth(sum(brandYtd,'cyUsd'),sum(brandYtd,'py1Usd'));
  let recovery='consistent with MAT';
  if(ytdG > matG + .05) recovery='showing better YTD momentum than MAT';
  if(ytdG < matG - .05) recovery='weaker YTD momentum than MAT';
  return {
    findings:`For ${state.product} in ${country().label}, the molecule trend is ${qGrowth(matG)} on MAT and ${qGrowth(ytdG)} on YTD, ${recovery}. Brand YTD value momentum is ${qGrowth(brandG)}.`,
    actions:`Separate structural market change from brand execution. If molecule trend is weak but brand momentum is better, scale the brand actions. If both are weak, tighten patient selection and defend priority accounts.`,
    recommendations:`The trend slide should drive monthly decisions: reinforce the winning segment, fix the conversion gap, or reduce investment in areas where market behavior is moving against the brand.`
  };
}
function competitorNarrative(){
  const comps=topCompetitors(5);
  const pd=productDef();
  const rows=dataRows(state.country,'YTD').filter(r=>matchesMol(r,pd));
  const brand=aggregateByProduct(rows).find(x=>matchKeyword(x.name,pd.brandKeywords||[]));
  const compText=smartJoin(comps.map(x=>x.name),5);
  const faster=comps.filter(c=>growth(c.cyUnit,c.py1Unit)>growth(brand?.cyUnit||0,brand?.py1Unit||0)).map(c=>c.name);
  return {
    findings:`The competitor profile for ${state.product} in ${country().label} should focus on ${compText}. These are the brands most likely to take prescriptions, counter conversions, or customer preference.`,
    actions:`Complete field intelligence for each priority competitor: active campaigns, price pressure, KOL movement, stock behavior, and pharmacy substitution. Competitors currently moving faster than the brand include ${smartJoin(faster,3)}.`,
    recommendations:`Assign one response per competitor: defend, attack, monitor, or ignore. Avoid spending resources on competitors that do not influence the selected brand’s prescription or dispensing outcome.`
  };
}

function marketHtml(label,level){
  const source=filteredForLevel(level);
  const parentName=parentForLevel(level);
  const keyLabel=keyForLevel(level);
  const focus=hierarchyTarget(level);
  let rows=aggregate(source,r=>r[level]).filter(x=>x.name&&x.name!=='Undefined');
  const total={name:parentName||'Total Market',py1Usd:sum(source,'py1Usd'),cyUsd:sum(source,'cyUsd'),isTotal:true};
  const pyRank=rank(rows,'py1Usd'), cyRank=rank(rows,'cyUsd');
  const totalCy=total.cyUsd||1,totalPy=total.py1Usd||1;
  rows=rows.sort((a,b)=>(cyRank.get(a.name)||99)-(cyRank.get(b.name)||99)).slice(0, level==='atc1'?8:7);
  const allRows=[total,...rows];
  const rowClasses=allRows.map(x=>x.isTotal?'':(norm(x.name)===norm(focus)?'focus-row':''));
  const body=allRows.map(x=>[
    x.isTotal?esc(x.name):(norm(x.name)===norm(focus)?emphasisTag(x.name):esc(x.name)),
    x.isTotal?'':pyRank.get(x.name)||'',
    x.isTotal?'':cyRank.get(x.name)||'',
    fmt(x.py1Usd),
    fmt(x.cyUsd),
    spanPct(growth(x.cyUsd,x.py1Usd)),
    x.isTotal?'':pct(x.py1Usd/totalPy),
    x.isTotal?'':pct(x.cyUsd/totalCy)
  ]);
  return `<h2 class="slide-title">${level==='atc1'?'Market Analysis – USD - MAT':'Market Analysis Sales Analysis – USD - MAT'}</h2>${table([keyLabel,'MAT 24<br>USD Value Ranked','MAT 25<br>USD Value Ranked','MAT 24<br>USD Value','MAT 25<br>USD Value','MAT 25<br>USD Value Growth % PY','MAT 24<br>USD Value Market Share','MAT 25<br>USD Value Market Share'],body,'',rowClasses)}${commentsBlock(marketInsight(level), country().source, dataDrivenLevelComment(level))}`;
}

function brandMetrics(period='YTD'){
  const all=dataRows(state.country,period); const pd=productDef();
  const mol=all.filter(r=>matchesMol(r,pd));
  const brand=mol.filter(r=>matchesBrand(r,pd));
  const totalMarket=all.length?all:mol;
  return {
    brandValue:sum(brand,'cyUsd'), brandValuePy:sum(brand,'py1Usd'),
    brandUnits:sum(brand,'cyUnit'), brandUnitsPy:sum(brand,'py1Unit'),
    moleculeValue:sum(mol,'cyUsd'), moleculeValuePy:sum(mol,'py1Usd'),
    totalValue:sum(totalMarket,'cyUsd')
  };
}
function growthLabel(curr,prev){ const g=growth(curr,prev); return `${g>=0?'Growing':'Contracting'} ${pct(Math.abs(g))}`; }
function hierarchyTarget(level){ const h=hierarchy(); return level==='atc1'?h.atc1: level==='atc2'?h.atc2: level==='atc3'?h.atc3: level==='atc4'?h.atc4: level==='molecule'?h.molecule: ''; }
function emphasisTag(text,tag=''){ return esc(text); }
function matchKeyword(name,keywords=[]){ const n=norm(name); return keywords.some(k=>n.includes(norm(k))); }
function pathwaySmartArt(){ const h=hierarchy(); const items=[['ATC1',h.atc1],['ATC2',h.atc2],['ATC3',h.atc3],['ATC4',h.atc4],['Molecule',h.molecule],['Brand',state.product]]; return `<div class="pathway-smartart">${items.map(([k,v],i)=>`<div class="path-step ${i===items.length-1?'brand-step':''}"><span>${esc(k)}</span><b>${esc(v||'—')}</b></div>${i<items.length-1?'<div class="path-arrow">›</div>':''}`).join('')}</div>`; }
function insightCard(title,body,cls=''){ return `<div class="card neon-card ${cls}"><h3>${esc(title)}</h3><p>${body}</p></div>`; }
function kpiStrip(){ const m=brandMetrics('YTD'); const share = m.moleculeValue? pct(m.brandValue/m.moleculeValue) : '0%'; return `<div class="kpi-strip"><div class="kpi-card"><span>Brand Value YTD</span><b>${fmt(m.brandValue)}</b></div><div class="kpi-card"><span>Brand Growth YTD</span><b>${growthLabel(m.brandValue,m.brandValuePy)}</b></div><div class="kpi-card"><span>Molecule Share YTD</span><b>${share}</b></div><div class="kpi-card"><span>Brand Units YTD</span><b>${fmt(m.brandUnits)}</b></div></div>`; }
function spotlightPanel(level){ const source=filteredForLevel(level); const focus=hierarchyTarget(level); const grouped=aggregate(source,r=>r[level]).filter(x=>x.name&&x.name!=='Undefined').sort((a,b)=>b.cyUsd-a.cyUsd).slice(0,5); const max=Math.max(...grouped.map(x=>x.cyUsd),1); return `<div class="spotlight-panel"><div class="spotlight-copy"><h3>Selected therapeutic path</h3><p><b>${esc(state.product)}</b> is analyzed through <b>${esc(focus||'the selected pathway')}</b>. The highlighted row in the table marks the exact route from the total market into the brand's class, sub-class, molecule and product arena.</p></div><div class="spotlight-bars">${grouped.map(x=>`<div class="mini-bar ${norm(x.name)===norm(focus)?'active':''}"><span>${esc(x.name)}</span><div class="mini-track"><div class="mini-fill" style="width:${Math.max(8,(x.cyUsd/max)*100)}%"></div></div></div>`).join('')}</div></div>`; }
function marketInsight(level){
  const h=hierarchy();
  if(level==='atc1') return `Use the total-market view to decide whether the selected therapeutic area deserves stronger investment, tighter prioritization, or a more defensive allocation in ${country().label}.`;
  if(level==='atc2') return `At parent-class level, the plan should identify whether the category still creates quality demand that can be converted through Dar Aldawa field execution and pharmacy discipline.`;
  if(level==='atc3') return `This layer should guide resource focus: concentrate on the sub-space where prescriber behavior is reachable and where the brand can defend conversion.`;
  if(level==='atc4') return `The sub-class view should translate into account-level priorities, not broad coverage. Use it to choose the segment where message, availability, and trade execution can work together.`;
  return `The molecule arena is where strategic intent becomes competitive execution. The brand plan should convert molecule relevance into preference, availability, and repeat dispensing.`;
}
function strategicComment(level){const b=bp(); if(level==='atc1') return `${country().label} should be interpreted through resource allocation: the selected brand must justify investment by showing a clear route from total retail medicine dynamics into its own therapeutic opportunity.`; if(level==='atc2') return `The parent class view sets the strategic playing field and should explain whether the category still creates enough quality demand to support focused execution.`; if(level==='atc3') return `This layer should identify whether prescribing behavior is shifting toward or away from the therapeutic space most relevant to ${state.product}.`; if(level==='atc4') return `The sub-class view should guide where the brand should defend, expand, or reallocate effort based on patient-flow and competitive pressure.`; return `The molecule view is the core competitive arena; the plan should convert market presence into preference, availability, and repeat dispensing.`;}

function brandProductName(r){
  return String(r.product || r.companyBrand || r.brandName || r.sku || 'Undefined').trim();
}
function aggregateByProduct(rows){
  return aggregate(rows, r=>brandProductName(r))
    .filter(x=>x.name && x.name !== 'Undefined');
}
function selectedBrandAggName(){
  const pd=productDef();
  const ytd=dataRows(state.country,'YTD').filter(r=>matchesMol(r,pd));
  const brand=ytd.filter(r=>matchesBrand(r,pd));
  const by=aggregateByProduct(brand).sort((a,b)=>(b.cyUnit||0)-(a.cyUnit||0));
  return by[0]?.name || (pd.brandKeywords?.[0] || state.product);
}
function productTableRows(period){
  const pd=productDef();
  const all=dataRows(state.country,period);
  const source=all.filter(r=>matchesMol(r,pd));
  const market=source.length?source:all;
  let products=aggregateByProduct(market);
  const selectedName=selectedBrandAggName();
  const selected=products.find(x=>matchKeyword(x.name,pd.brandKeywords||[]) || norm(x.name)===norm(selectedName));
  const sorted=products.sort((a,b)=>(b.cyUnit||0)-(a.cyUnit||0));
  let displayed=sorted.slice(0,5);
  if(selected && !displayed.some(x=>norm(x.name)===norm(selected.name))){
    displayed=sorted.slice(0,4).concat([selected]);
  }
  const displaySet=new Set(displayed.map(x=>norm(x.name)));
  const rest=products.filter(x=>!displaySet.has(norm(x.name)));
  if(rest.length){
    displayed.push({
      name:`Others (${rest.length})`,
      py1Usd:sum(rest,'py1Usd'),
      cyUsd:sum(rest,'cyUsd'),
      py1Unit:sum(rest,'py1Unit'),
      cyUnit:sum(rest,'cyUnit'),
      py2Usd:sum(rest,'py2Usd'),
      py2Unit:sum(rest,'py2Unit'),
      isOthers:true,
      rows:rest.flatMap(x=>x.rows||[])
    });
  }
  return {market, products, displayed, selectedName};
}
function productCompetitorNames(limit=4){
  const {displayed}=productTableRows('YTD');
  const pd=productDef();
  return displayed
    .filter(x=>!x.isOthers && !(matchKeyword(x.name,pd.brandKeywords||[])))
    .map(x=>x.name)
    .slice(0,limit);
}
function detailedProductTableComment(period){
  const comps=productCompetitorNames(4);
  const compText=comps.length?comps.join(', '):topCompetitors(3).map(x=>x.name).join(', ');
  return {
    findings:`The ${period} table now frames the real molecule battlefield: the selected brand is shown against the top product competitors, with the tail grouped under Others. For ${state.product}, the competitive read should focus on which of ${compText || 'the priority competitors'} is pulling share through stronger demand, stronger availability, or pharmacy substitution.`,
    actions:`Build a named competitor action plan by account: defend against the leading brands, identify where ${state.product} is losing conversion, and assign field/trade actions by customer segment, SKU, and pharmacy availability risk.`,
    recommendations:`Keep the brand plan competitor-specific. The table should trigger clear choices: attack vulnerable competitors, protect accounts where the selected brand is at risk, and use Others as an indicator of fragmentation or opportunity to consolidate share.`
  };
}

function productHtml(period){
  const pd=productDef();
  const {market, products, displayed}=productTableRows(period);
  const total={name:pd.ingredient,py1Usd:sum(market,'py1Usd'),cyUsd:sum(market,'cyUsd'),py1Unit:sum(market,'py1Unit'),cyUnit:sum(market,'cyUnit'),isTotal:true};
  const pu=rank(products,'py1Unit'), cu=rank(products,'cyUnit'), pv=rank(products,'py1Usd'), cv=rank(products,'cyUsd');
  const totalCU=total.cyUnit||1,totalPU=total.py1Unit||1,totalCV=total.cyUsd||1,totalPV=total.py1Usd||1;
  const allRows=[total,...displayed];
  const rowClasses=allRows.map(x=>{
    if(x.isTotal) return '';
    if(x.isOthers) return 'others-row';
    return matchKeyword(x.name, pd.brandKeywords||[]) ? 'focus-row brand-row' : 'competitor-row';
  });
  const body=allRows.map(x=>[
    x.isTotal?esc(x.name):esc(x.name),
    x.isTotal||x.isOthers?'':pu.get(x.name)||'',
    x.isTotal||x.isOthers?'':cu.get(x.name)||'',
    fmt(x.py1Unit),fmt(x.cyUnit),spanPct(growth(x.cyUnit,x.py1Unit)),
    x.isTotal?'':pct(x.py1Unit/totalPU),
    x.isTotal?'':pct(x.cyUnit/totalCU),
    x.isTotal||x.isOthers?'':pv.get(x.name)||'',
    x.isTotal||x.isOthers?'':cv.get(x.name)||'',
    fmt(x.py1Usd),fmt(x.cyUsd),spanPct(growth(x.cyUsd,x.py1Usd)),
    x.isTotal?'':pct(x.py1Usd/totalPV),
    x.isTotal?'':pct(x.cyUsd/totalCV)
  ]);
  return `<h2 class="slide-title">Market Analysis Sales Analysis – Units/Value - ${period}</h2>
  ${table(['Molecule\\ Product',`${period} 24<br>Units Ranked`,`${period} 25<br>Units Ranked`,`${period} 24<br>Units`,`${period} 25<br>Units`,`${period} 25<br>Units Growth % PY`,`${period} 24<br>Units Market Share`,`${period} 25<br>Units Market Share`,`${period} 24<br>USD Value Ranked`,`${period} 25<br>USD Value Ranked`,`${period} 24<br>USD Value`,`${period} 25<br>USD Value`,`${period} 25<br>USD Value Growth % PY`,`${period} 24<br>USD Value Market Share`,`${period} 25<br>USD Value Market Share`],body,'wide-table',rowClasses)}
  ${commentsBlock(productComment(period), country().source, productTableNarrative(period))}`;
}
function productComment(period){return `${period} performance should separate structural market pressure from brand execution. The country action plan should focus on accounts and channels where ${state.product} can convert presence into preference, availability, and repeat dispensing.`;}
function spanPct(x){return `<span class="${x<0?'neg':'pos'}">${pct(x)}</span>`;}
function table(headers,rows,cls='',rowClasses=[]){return `<div class="table-wrap"><table class="mp-table ${cls}"><thead><tr>${headers.map(h=>`<th>${h}</th>`).join('')}</tr></thead><tbody>${rows.map((r,i)=>`<tr class="${[i===0?'total-row':'',rowClasses[i]||''].filter(Boolean).join(' ')}">${r.map(c=>`<td>${c}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;}

function topCompetitors(limit=5){
  const library = BRAND_COMPETITORS[state.product] || [];
  const pd=productDef();
  const rows=dataRows(state.country,'YTD').filter(r=>matchesMol(r,pd));
  const brandKeys=pd.brandKeywords||[];
  const detected = aggregateByProduct(rows)
    .filter(x=>x.name && !matchKeyword(x.name, brandKeys))
    .sort((a,b)=>(b.cyUnit||0)-(a.cyUnit||0))
    .map(x=>({name:x.name, cyUnit:x.cyUnit, cyUsd:x.cyUsd, positioning:competitorPositioning(x.name)}));

  const merged=[];
  [...detected, ...library].forEach(c=>{
    if(!c?.name) return;
    if(!merged.some(x=>norm(x.name)===norm(c.name))) merged.push(c);
  });
  return merged.slice(0,limit);
}
function competitorRows(){
  const comps=topCompetitors(5);
  const pd=productDef();
  const totalUnits = sum(dataRows(state.country,'YTD').filter(r=>matchesMol(r,pd)), 'cyUnit') || 0;
  return comps.map(c=>{
    const share = totalUnits && c.cyUnit ? pct((c.cyUnit||0)/totalUnits) : 'To be validated';
    return [
      esc(c.name),
      share,
      esc(bp().patients.slice(0,2).join('; ')),
      esc(c.positioning || competitorPositioning(c.name)),
      'To be completed from field feedback / activity tracker',
      '',
      'Strategic competitor',
      ''
    ];
  });
}
function competitorPositioning(name){
  const n=norm(name);
  if(n.includes('SUPRAX') || n.includes('CEFIX') || n.includes('MAGNACEF')) return 'Established cefixime competitor; defend through trust, availability, and SKU focus';
  if(n.includes('AUGMENTIN') || n.includes('CLAV')) return 'Strong amoxiclav equity; compete through access, availability, and price confidence';
  if(n.includes('CIPRO') || n.includes('CIPROBAY')) return 'Fluoroquinolone competitor; compete through patient selection and responsible-use confidence';
  if(n.includes('ROGAINE') || n.includes('MINOX')) return 'Hair-loss OTC competitor; compete through routine simplicity and pharmacy counseling';
  if(n.includes('CRESTOR') || n.includes('ROSU')) return 'Statin competitor; compete through chronic-care confidence and refill continuity';
  if(n.includes('FORXIGA') || n.includes('DAPAG')) return 'SGLT2 competitor; compete through chronic-care access and specialist focus';
  return 'Competes on molecule familiarity, access, pharmacy substitution, and field execution';
}
function buildTableActions(context='market'){
  const h = hierarchy();
  const competitors = topCompetitors(3).map(x=>x.name).filter(Boolean);
  const competitorText = competitors.length ? competitors.join(', ') : 'the priority competitor set';
  return {
    findings: `${state.product} competes against ${competitorText}. The strategic issue is whether the brand has a clear enough patient-fit, prescriber-trust, and pharmacy-conversion story to win against these specific competitors.`,
    actions: `Build account actions against the selected competitors: define which accounts are at risk, which competitor is driving the pressure, and what field/trade response is needed for ${state.product}.`,
    recommendations: `Prioritize competitor-specific defense over broad coverage. Each monthly IQVIA update should trigger a competitor action: defend, attack, or reallocate.`
  };
}
function commentsBlock(comment, reference='Reference', custom=null){
  const a = custom || buildTableActions();
  function asBullets(txt){ return String(txt||'').split(/(?<=\.)\s+(?=[A-Z0-9])/).filter(Boolean).map(x=>`<li>${x}</li>`).join(''); }
  return `<div class="comments-row pro-comments narrative-comments"><div class="reference-label">${esc(reference||'Reference')}</div><div class="comments-box"><div class="comment-grid distinct-comments"><div class="finding-card"><b>Findings</b><ul>${asBullets(a.findings)}</ul></div><div class="action-card"><b>Actions</b><ul>${asBullets(a.actions)}</ul></div><div class="recommendation-card"><b>Recommendations</b><ul>${asBullets(a.recommendations)}</ul></div></div><div class="comment-text hide">${esc(comment||'')}</div></div></div>`;
}
function shapeHtml(metric){
  const pd=productDef(); const key=metric==='Units'?'cyUnit':'cyUsd';
  const all=dataRows(state.country,'YTD').filter(r=>matchesMol(r,pd));
  const brandRows=all.filter(r=>matchesBrand(r,pd));
  const marketByDosage=aggregate(all,r=>r.dosage||r.pack||r.sku||'Unspecified').sort((a,b)=>b[key]-a[key]).slice(0,5);
  const brandByDosage=aggregate(brandRows,r=>r.dosage||r.pack||r.sku||'Unspecified').sort((a,b)=>b[key]-a[key]).slice(0,5);
  const marketBySku=aggregate(all,r=>r.sku||r.strength||r.pack||'Unspecified').sort((a,b)=>b[key]-a[key]).slice(0,5);
  const brandBySku=aggregate(brandRows,r=>r.sku||r.strength||r.pack||'Unspecified').sort((a,b)=>b[key]-a[key]).slice(0,5);
  return `<h2 class="slide-title">Market Shape - ${metric}</h2>
    <div class="shape-pro">
      <div class="shape-story"><b>Interpretation</b><p>${esc(deep().shapeIntro)}</p></div>
      <div class="shape-card"><h3>${esc(pd.ingredient)} dosage / pack contribution</h3>${bars(marketByDosage,key)}</div>
      <div class="shape-card"><h3>${esc(state.product)} dosage / pack contribution</h3>${bars(brandByDosage,key)}</div>
      <div class="shape-card"><h3>${esc(pd.ingredient)} SKU contribution</h3>${bars(marketBySku,key)}</div>
      <div class="shape-card"><h3>${esc(state.product)} SKU contribution</h3>${bars(brandBySku,key)}</div>
    </div>
    ${commentsBlock('Market shape interpretation', country().source, shapeNarrative(metric))}`;
}
function bars(items,key){const max=Math.max(...items.map(x=>x[key]),1); return items.length?items.map(x=>`<div class="bar-row"><span>${esc(x.name)}</span><div class="bar-track"><div class="bar-fill" style="width:${Math.max(4,x[key]/max*100)}%"></div></div><b>${fmt(x[key])}</b></div>`).join(''):'<p class="muted">No brand rows detected. Validate naming in the IQVIA file.</p>';}
function trendHtml(){
  const m=brandMetrics('YTD');
  return `<h2 class="slide-title">Market Trend</h2>
  <div class="trend-board rich-trend">
    <div><b>Guidelines & prescribing behavior</b><p>${esc(bp().area)} should be interpreted through evolving patient selection, specialty habits, and the degree of clinical caution affecting the class.</p></div>
    <div><b>Demand & competition</b><p>Demand quality is shaped by patient flow, competitor investment, pharmacy substitution, and the ability of the brand to stand for a clear reason to choose.</p></div>
    <div><b>Pricing & access</b><p>${esc(cp().access)}. Price corridor, availability, and channel dynamics should be treated as strategic drivers, not only operational details.</p></div>
    <div><b>Brand trajectory</b><p>The current brand trend is <b>${esc(growthLabel(m.brandValue,m.brandValuePy))}</b>; the implication is to separate market pressure from execution gaps.</p></div>
  </div>
  ${commentsBlock('Market trend interpretation', 'Reference', trendNarrative())}`;
}
function productsPricesHtml(){return `<h2 class="slide-title">Products Prices</h2>${table(['SKU','Company','Product','Public Price per pack  (LC)','Treatment Cost per day (LC)'],Array.from({length:7},()=>['','','','','']))}<div class="comments-row"><div></div><div class="comments-box"><b>Comments:</b><div class="comment-text">Treatment cost per day calculated based on one month</div></div></div>`;}
function competitorsHtml(){
  const rows = competitorRows();
  const fallback = rows.length ? rows : Array.from({length:3},()=>['','','','','','','','']);
  const comps = topCompetitors(4).map(x=>x.name).join(', ') || 'priority competitors';
  return `<h2 class="slide-title">Key Competitors Profile</h2>
  <div class="competitor-chipline"><b>Selected brand competitors:</b> ${esc(comps)}</div>
  ${table(['Competitor','Market Share% (Units)','Current and Future Indications','Positioning / Core Benefit','Impactful activities','Size of Sales Force for Product','Role of the Brand in Their Portfolio','Launch Date/(Estimated)'],fallback,'wide-table')}
  <div class="competitor-summary">${insightCard('Competition analysis', `${esc(state.product)} should be defended against ${esc(comps)} through account-level prioritization, differentiated patient fit, and pharmacy conversion control.`)}${insightCard('Sales team feedback', 'Complete with field intelligence: active campaigns, trade pressure, KOL movement, availability gaps, and counter-substitution patterns.')}</div>
  ${commentsBlock('Competitor analysis', 'Reference', competitorNarrative())}`;
}
function healthcareHtml(){return `<h2 class="slide-title">Healthcare structure</h2><div class="health-map"><div class="health-node main-node neon-outline">Total Health Market</div><div class="health-split"><div class="health-node">Private<br><span>(64%)*</span></div><div class="health-node">Governmental<br><span>(36%)*</span></div></div><div class="health-split small-split"><div class="health-node">Insured</div><div class="health-node">Cash payers</div><div class="health-node">MOH</div><div class="health-node">DRMS</div><div class="health-node">JUH</div><div class="health-node">KAUH</div></div></div><div class="two-col">${insightCard('Implication for the brand', `${state.product} should prioritize the care settings and payer environments that most directly influence prescribing and refill behavior in ${country().label}.`)}${insightCard('Country execution note', cp().healthcare.join(' '))}</div><div class="reference-label">Reference</div>`;}
function chainHtml(){
  const comps=topCompetitors(4).map(x=>x.name).join(', ') || 'priority competitors';
  return `<h2 class="slide-title">Customers chain analysis</h2>
  <div class="competitor-chipline chain-chips"><b>Competitors affecting the selected brand:</b> ${esc(comps)}</div>
  <div class="chain-master elegant-chain">
    <div class="chain-left">
      <div class="chain-panel-title">Findings:</div>
      <p>For ${esc(state.product)}, the patient remains the final outcome, but the brand decision is shaped by multiple upstream and downstream stakeholders. HCPs drive initiation, pharmacists influence final dispensing, caregivers shape adherence and preference, while competitors create continuous substitution pressure. The thickness of the arrows reflects impact intensity: major, moderate, or minor.</p>
      <div class="chain-panel-title">Strategic Conclusion:</div>
      <p>The brand must win the clinical recommendation and defend the retail conversion. This means: stronger HCP conviction, visible pharmacy availability, differentiated counseling support, and competitor-specific defense in the accounts where switch risk is highest.</p>
    </div>
    <div class="chain-visual-card">
      <svg class="chain-svg" viewBox="0 0 560 360" xmlns="http://www.w3.org/2000/svg" aria-label="Customer chain analysis">
        <defs>
          <marker id="arrTeal" markerWidth="12" markerHeight="12" refX="10" refY="6" orient="auto"><path d="M0,0 L12,6 L0,12 Z" fill="#00a991"/></marker>
          <marker id="arrPurple" markerWidth="12" markerHeight="12" refX="10" refY="6" orient="auto"><path d="M0,0 L12,6 L0,12 Z" fill="#7432a8"/></marker>
          <marker id="arrGold" markerWidth="12" markerHeight="12" refX="10" refY="6" orient="auto"><path d="M0,0 L12,6 L0,12 Z" fill="#bd9200"/></marker>
          <marker id="arrOrange" markerWidth="12" markerHeight="12" refX="10" refY="6" orient="auto"><path d="M0,0 L12,6 L0,12 Z" fill="#ca5a0d"/></marker>
          <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="10" stdDeviation="10" flood-color="#0c3145" flood-opacity=".18"/>
          </filter>
        </defs>
        <line x1="280" y1="90" x2="280" y2="158" stroke="#00a991" stroke-width="22" marker-end="url(#arrTeal)" stroke-linecap="round"/>
        <line x1="428" y1="110" x2="334" y2="194" stroke="#7432a8" stroke-width="14" marker-end="url(#arrPurple)" stroke-linecap="round"/>
        <line x1="416" y1="294" x2="335" y2="248" stroke="#bd9200" stroke-width="18" marker-end="url(#arrGold)" stroke-linecap="round"/>
        <line x1="134" y1="186" x2="206" y2="186" stroke="#ca5a0d" stroke-width="12" marker-end="url(#arrOrange)" stroke-linecap="round"/>
        <circle cx="280" cy="58" r="56" fill="#00a991" filter="url(#softShadow)"/><text x="280" y="67" text-anchor="middle" fill="#fff" font-size="24" font-weight="700">HCP</text>
        <circle cx="280" cy="224" r="58" fill="#76b041" filter="url(#softShadow)"/><text x="280" y="233" text-anchor="middle" fill="#fff" font-size="24" font-weight="700">Patient</text>
        <circle cx="475" cy="100" r="54" fill="#7432a8" filter="url(#softShadow)"/><text x="475" y="109" text-anchor="middle" fill="#fff" font-size="22" font-weight="700">Caregiver</text>
        <circle cx="462" cy="319" r="60" fill="#bd9200" filter="url(#softShadow)"/><text x="462" y="328" text-anchor="middle" fill="#fff" font-size="22" font-weight="700">Pharmacist</text>
        <circle cx="82" cy="186" r="54" fill="#ca5a0d" filter="url(#softShadow)"/><text x="82" y="195" text-anchor="middle" fill="#fff" font-size="21" font-weight="700">Competitors</text>
        <rect x="18" y="316" rx="12" ry="12" width="250" height="28" fill="#f7fcfb" stroke="#d7ebe7"/><text x="33" y="335" fill="#37586b" font-size="13">Arrow thickness = level of impact (major / moderate / minor)</text>
      </svg>
    </div>
  </div>
  <div class="reference-label">Reference</div>`;
}
function swotHtml(){
  const s=deep().swot;
  return `<h2 class="slide-title">SWOT analysis</h2><div class="swot-premium">
    <div class="swot-cell strengths"><h3>Strengths</h3>${s.strengths.map((x,i)=>`<p><b>S${i+1}.</b> ${esc(x)}</p>`).join('')}</div>
    <div class="swot-cell weaknesses"><h3>Weaknesses</h3>${s.weaknesses.map((x,i)=>`<p><b>W${i+1}.</b> ${esc(x)}</p>`).join('')}</div>
    <div class="swot-cell opportunities"><h3>Opportunities</h3>${s.opportunities.map((x,i)=>`<p><b>O${i+1}.</b> ${esc(x)}</p>`).join('')}</div>
    <div class="swot-cell threats"><h3>Threats</h3>${s.threats.map((x,i)=>`<p><b>T${i+1}.</b> ${esc(x)}</p>`).join('')}</div>
  </div>`;
}
function csfHtml(){
  const items=deep().csf;
  return `<h2 class="slide-title">Critical Success Factor</h2><div class="csf-board">
    ${items.slice(0,6).map((x,i)=>`<div class="csf-tile"><span>CSF ${i+1}</span><b>${esc(x)}</b><p>This factor must be owned, measured, and reviewed monthly because it directly influences whether the brand plan can deliver the desired goals.</p></div>`).join('')}
  </div>`;
}
function objectivesHtml(){return `<h2 class="slide-title">Strategic objectives</h2>${table(['','2026','2027','2028'],[['Qualitative <br>Objectives','Build preference, sharpen targeting, and protect conversion in the highest-yield accounts.','Scale the winning model and deepen advocacy in top specialties and trade accounts.','Consolidate leadership in priority segments and sustain profitable growth.'],['Quantitative Objectives','Land disciplined growth and protect share in the therapeutic path.','Outgrow the selected competitive set and widen account penetration.','Sustain market share gains while improving execution productivity.'],['Sales Units','','',''],['PPG%','','',''],['MS%','','','']])}`;}

function brandPlanNarrative(){
  const pd=productDef();
  const comps=topCompetitors(3).map(x=>x.name).join(', ') || 'priority competitors';
  return {
    battlefield:`${state.product} should be planned against ${comps}, not only against the molecule average. The success question is whether the brand can create a stronger reason to prescribe, stock, recommend, and repeat.`,
    positioning:`For ${bp().patients[0]} in ${country().label}, ${state.product} is the Dar Aldawa ${pd.ingredient} brand designed to win through the right patient fit, consistent availability, clear stakeholder confidence, and stronger defense versus ${comps}.`,
    core:`Build demand where the clinical decision starts, protect conversion where substitution happens, and translate every market signal into named account actions against ${comps}.`
  };
}

function positioningHtml(){
  const d=deep();
  return `<h2 class="slide-title">Positioning</h2>
  <div class="positioning-premium">
    <div class="positioning-statement"><span>Positioning Statement</span><p>${esc(d.positioning)}</p></div>
    <div class="rtb-panel"><h3>Reasons to believe</h3><ul>${bp().rtb.map(x=>`<li>${esc(x)}</li>`).join('')}</ul></div>
    <div class="positioning-implication"><b>Strategic implication</b><p>Positioning must be visible in the customer target list, field message, pharmacy activation, competitor defense plan, and monthly IQVIA action review.</p></div>
  </div>`;
}

function segmentationContent(){
  const d=deep();
  const comps=topCompetitors(4).map(x=>x.name).join(', ') || 'priority competitors';
  const aud=bp().audiences || [];
  if(state.product === 'Mixif - Murex'){
    return {
      primary:[
        ['Otitis media','Ped., GP & ER','1- Mixif is effective against the most frequently identified pathogens in acute otitis media.<br>2- Cefixime is as effective as amoxycillin in otitis media and significantly more effective when <i>H. influenzae</i> is suspected.<br>3- Cefixime is effective against <i>Haemophilus influenzae</i>, a frequently identified pathogen in recurrent otitis media.','Brochure'],
        ['Pharyngitis / Tonsillitis','Ped., GP & ER','1- Mixif is effective against commonly identified pathogens in pharyngitis and tonsillitis in adults and children.<br>2- Mixif differentiates the cefixime story through convenient oral use and practical patient-fit communication.','Brochure'],
        ['Bacterial gastroenteritis','Ped., GP & ER','1- Mixif can play a role in selected gastrointestinal infection patients where oral cefixime is appropriate.<br>2- The segment should be approached with careful patient selection and a clear stewardship-aware message.','Brochure, DC'],
        ['UTI','Gyn., Ped., GP & ER','1- Mixif has a clear role in selected urinary tract infection patients.<br>2- A focused 400 mg capsule message can support adult prescribing where cefixime is appropriate.<br>3- Mixif suspension strengthens pediatric relevance when dose clarity and caregiver convenience matter.','Brochure']
      ],
      general:[
        ['Pregnancy-related UTI','Gynecologists / GP','Mixif should be communicated with a careful, physician-led message around appropriate cefixime use in selected patients, emphasizing trust, convenience, and patient-fit clarity.','Brochure'],
        ['Pediatric acceptance','Pediatricians / Pharmacists','Palatable Tutti Frutti taste, suspension format, and dosing syringe should be turned into a pediatric convenience story that competitors cannot easily own.','3D video, Brochure'],
        ['Dosing confidence','Ped., GP & ER / Pharmacists','The user-friendly dosing syringe supports accurate counseling by volume or weight and gives pharmacists a practical reason to defend Mixif at the counter.','3D video, Brochure'],
        ['Pharmacy defense','Pharmacists','Convert written prescriptions into Mixif dispensing by reinforcing availability, shelf visibility, and counter-substitution defense versus Cefix, Suprax, Betixim and Magnacef.','RTD, counter activation']
      ],
      support:[
        ['Increase the power of prescription','Strengthen prescriber preference by making Mixif the default, clinically appropriate cefixime through concise, evidence-based, stewardship-aligned messaging that clearly defines patient need, highlights dosing simplicity, and differentiates Mixif from alternative antibiotics.','O1, O2, O3'],
        ['Pharmacy Channel Optimization','Convert prescriptions into Mixif at the point of dispense and minimize counter-substitution. Manage the pharmacy as a performance channel ensuring availability, clear product choice architecture, and pharmacist confidence to recommend and counsel Mixif.','O3'],
        ['Brand awareness','Make Mixif top-of-mind and clearly differentiated among prescribers, pharmacists, and caregivers. Build brand equity around once-daily simplicity, palatability, pediatric convenience, and trusted Dar Aldawa quality.','O2'],
        ['Competitive Defense & Market Expansion','Protect the current base while systematically capturing share from Cefix, Suprax, Betixim, Magnacef, and Others. Use IQVIA to identify at-risk accounts and under-penetrated cefixime segments.','O1']
      ]
    };
  }
  return {
    primary:[
      ['Core clinical segment',aud.slice(0,3).join(', ') || 'Priority HCPs',`1- Position ${state.product} around the strongest patient-fit within ${productDef().ingredient}.<br>2- Make the customer message simple, credible, and linked to the real prescribing trigger.<br>3- Defend against ${comps} with a clear reason to choose ${state.product}.`,'Detail aid / Brochure'],
      ['Growth segment',aud.slice(0,3).join(', ') || 'Priority customers',`1- Identify the patient pool where the brand can grow without spreading effort.<br>2- Convert class relevance into a differentiated brand story.<br>3- Focus the field force on accounts with real conversion potential.`,'KOL discussion / Detail aid'],
      ['Pharmacy conversion','Pharmacists',`1- Protect prescriptions from substitution by improving availability, recommendation confidence, and shelf visibility.<br>2- Train pharmacists on the brand’s role versus ${comps}.<br>3- Track switch risk monthly.`,'RTD / Counter card'],
      ['Competitor defense','Priority accounts',`1- Name the competitor causing pressure in each account.<br>2- Choose a defense action: message correction, stock correction, pharmacist engagement, or prescriber reinforcement.<br>3- Recheck impact after the monthly IQVIA update.`,'Account action sheet']
    ],
    general:[
      ['Brand reason to choose','All priority customers',d.positioning,'Core detail aid'],
      ['Main battlefield','Field force / Supervisors',d.battlefield,'Coaching guide'],
      ['Retail conversion','Pharmacy channel','Availability, recommendation confidence, and anti-substitution follow-up should be treated as brand plan KPIs, not operational afterthoughts.','Pharmacy activation'],
      ['Monthly optimization','PM / Sales managers','Each monthly data update should result in a decision: defend, attack, reallocate, or stop.','Dashboard review']
    ],
    support:[
      ['Demand generation',`Build demand in the segments where ${state.product} has the strongest patient fit and where the brand can clearly differentiate versus ${comps}.`,'O1, O2'],
      ['Conversion at dispense','Protect the written prescription through availability, pharmacist confidence, and counter-substitution monitoring.','O3'],
      ['Brand differentiation',`Convert ${productDef().ingredient} familiarity into a memorable ${state.product} reason-to-believe that sales teams can repeat consistently.`,'S1, O2'],
      ['Competitive defense','Use named competitor pressure to guide account actions and ensure resources are directed to the highest-risk and highest-upside customers.','T1, T2']
    ]
  };
}

function targetingCards(rows){
  return `<div class="targeting-cards">${rows.map((r,i)=>`<div class="target-card"><div class="target-index">${String(i+1).padStart(2,'0')}</div><h3>${esc(r[0])}</h3><div class="target-audience">${esc(r[1])}</div><p>${r[2]}</p><div class="target-tools">${esc(r[3])}</div></div>`).join('')}</div>`;
}
function targetingHtml(){
  const content = segmentationContent();
  return `<h2 class="slide-title">Targeting , segmentation and messages</h2>${targetingCards(content.primary)}`;
}
function targetingGeneralHtml(){
  const content = segmentationContent();
  return `<h2 class="slide-title">Targeting platform messages</h2>${targetingCards(content.general)}`;
}
function coreStrategyHtml(){
  const d=deep();
  return `<h2 class="slide-title">Core marketing strategy</h2><div class="core-strategy-premium">
    <div class="core-main">${esc(d.core)}</div>
    <div class="core-pillars">
      <div><span>01</span><b>Prescription power</b><p>Win initiation through sharper patient-fit messaging and high-value account focus.</p></div>
      <div><span>02</span><b>Pharmacy conversion</b><p>Protect the written Rx through availability, pharmacist loyalty, and counter-substitution defense.</p></div>
      <div><span>03</span><b>Competitive attack</b><p>Convert named competitor pressure into focused actions, not generic market coverage.</p></div>
    </div>
  </div>`;
}
function supportiveHtml(){
  const content = segmentationContent();
  const rows = content.support.map((r,i)=>[i+1, ...r]);
  return `<h2 class="slide-title">Supportive strategies</h2><div class="supportive-intro">Every supportive strategy must ladder up to the same core direction: stronger prescription initiation, stronger pharmacy conversion, and sharper competitor defense.</div>${table(['#','Supportive Strategy','Detailed Description','Link to SWOT'],rows,'supportive-detailed')}`;
}
function actionsHtml(){return `<h2 class="slide-title">Actions based on strategies</h2><h3>Supportive Strategy</h3>${table(['Actions','Target audience','# of customers','Timing','Costs (USD)'],Array.from({length:5},()=>['','','','','']))}`;}
function timelineHtml(){return `<h2 class="slide-title">Plan timeline</h2>${table(['Activity','Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],Array.from({length:7},()=>['','','','','','','','','','','','','']))}`;}
function mainEventsHtml(){return `<h2 class="slide-title">Main events</h2>${table(['Event','Date','Type of Sponsorship','# of customers'],Array.from({length:5},()=>['','','','']))}`;}
function salesForecastSkuHtml(){const skus=brandSkuRows(); return `<h2 class="slide-title">Sales forecast – SKU</h2>${table(['UNITS','2024 Sales','2025<br>(YTD actual sales)','2025<br>(Landing)','2026 <br>(Forecast)','2027<br>(Forecast)','2028<br>(Forecast)'],skus.map(x=>[x,'','','','','','']))}<br>${table(['USD','2024 Sales','2025<br>(YTD actual sales)','2025<br>(Landing)','2026 <br>(Forecast)','2027<br>(Forecast)','2028<br>(Forecast)'],skus.map(x=>[x,'','','','','','']))}`;}
function brandSkuRows(){const rows=dataRows(state.country,'YTD').filter(r=>matchesBrand(r)); const skus=[...new Set(rows.map(r=>r.sku||r.product||r.brandName).filter(Boolean))].slice(0,5); return skus.length?skus:[`${state.product} SKU 1`,`${state.product} SKU 2`,`${state.product} SKU 3`,`${state.product} SKU 4`];}
function salesForecastTotalHtml(){return `<h2 class="slide-title">Sales forecast total - Value</h2>${table(['USD','2024 Sales','2025<br>(YTD actual sales)','2025<br>(Landing)','2026 <br>(Forecast)','2027<br>(Forecast)','2028<br>(Forecast)'],[['Brand Sales','','','','','',''],['Growth Rate','','','','','',''],['Market Share','','','','','','']])}<div class="forecast-method"><b>Forecast Methodology:</b></div>`;}
function expensesHtml(){return `<h2 class="slide-title">Overall expenses</h2>${table(['Item','USD'],Array.from({length:7},()=>['','']).concat([['Total',''],['A&P VS. Target (%)','']]))}`;}
function ownerManagersForProduct(product){
  return Object.entries(config.managers)
    .filter(([m,ps])=>m!=='Admin' && Array.isArray(ps) && ps.includes(product))
    .map(([m])=>m);
}
function preparedByName(){
  if(!state.isAdmin) return state.manager;
  return ownerManagersForProduct(state.product)[0] || 'Admin';
}
function managerNames(){ return Object.keys(config.managers).filter(m=>m!=='Admin').sort(); }
function productOptions(selected=[]){
  const set=new Set(selected||[]);
  return Object.keys(config.products).map(p=>`<option value="${esc(p)}" ${set.has(p)?'selected':''}>${esc(p)}</option>`).join('');
}
function managerOptions(selected=''){
  return managerNames().map(m=>`<option value="${esc(m)}" ${m===selected?'selected':''}>${esc(m)}</option>`).join('');
}
function adminMatrixHtml(){
  const rows=Object.keys(config.products).sort().map(p=>{
    const owners=ownerManagersForProduct(p);
    return `<tr><td><b>${esc(p)}</b></td><td>${esc(config.products[p].ingredient||'')}</td><td>${owners.length?owners.map(esc).join(', '):'<span class="muted">Unassigned</span>'}</td></tr>`;
  }).join('');
  return `<div class="admin-table-wrap"><table class="admin-table"><thead><tr><th>Product</th><th>Definition</th><th>Product Manager</th></tr></thead><tbody>${rows}</tbody></table></div>`;
}
function adminLog(msg,type='info'){
  const el=document.getElementById('uploadLog');
  if(!el) return;
  const cls=type==='error'?'log-error':(type==='ok'?'log-ok':'');
  el.innerHTML += `<div class="${cls}">${msg}</div>`;
  el.scrollTop = el.scrollHeight;
}
function setUploadProgress(value,label=''){
  const bar=document.getElementById('uploadProgressBar');
  const text=document.getElementById('uploadProgressText');
  const n=Math.max(0,Math.min(100,Math.round(value||0)));
  if(bar) bar.style.width=n+'%';
  if(text) text.textContent=`${n}%${label?' • '+label:''}`;
}
function sleep(ms=0){ return new Promise(resolve=>setTimeout(resolve,ms)); }
function renderAdmin(){
  const existing=document.querySelector('.admin-modal'); if(existing) existing.remove();
  const firstManager=managerNames()[0] || 'Azhar Said';
  const modal=document.createElement('div');
  modal.className='admin-modal';
  modal.innerHTML=`
  <div class="admin-shell-v2">
    <aside class="admin-rail">
      <div class="admin-brand"><span class="brand-mark"></span><div><b>Admin Center</b><small>Marketing Plan 2026</small></div></div>
      <button class="admin-tab-btn active" data-admin-tab="upload">IQVIA Data</button>
      <button class="admin-tab-btn" data-admin-tab="users">Users</button>
      <button class="admin-tab-btn" data-admin-tab="products">Products</button>
      <button class="admin-tab-btn" data-admin-tab="mapping">Product Manager Mapping</button>
      <button class="admin-tab-btn" data-admin-tab="console">Firebase Console</button>
    </aside>
    <main class="admin-workspace">
      <div class="admin-head">
        <div><h2>Admin Panel</h2><p>${esc(state.user.email)} • Firebase connected</p></div>
        <button class="danger" id="closeAdmin">Close</button>
      </div>

      <section class="admin-page active" id="admin-upload">
        <div class="admin-hero-card"><div><span class="admin-kicker">Monthly data update</span><h3>Upload IQVIA Excel bundle</h3></div><span class="status-pill">MAT / YTD</span></div>
        <div class="admin-card clean-card">
          <div class="field"><label>Excel or ZIP files</label><input type="file" id="iqviaFiles" multiple accept=".xlsx,.xls,.zip"></div>
          <div class="btn-row"><button class="primary" id="uploadIQVIA">Upload & publish</button><button class="ghost" id="clearUploadLog">Clear log</button></div>
          <div class="upload-progress"><div id="uploadProgressBar"></div></div>
          <div id="uploadProgressText" class="small">Ready</div>
          <div id="uploadLog" class="upload-log"><div>Ready.</div></div>
        </div>
      </section>

      <section class="admin-page" id="admin-users">
        <div class="admin-hero-card"><div><span class="admin-kicker">Access</span><h3>Add / update user</h3></div><a class="ghost admin-link" href="${AUTH_USERS_LINK}" target="_blank">Firebase Auth</a></div>
        <div class="admin-card clean-card form-grid-2">
          <div class="field"><label>Email</label><input id="userEmail" placeholder="name@dadgroup.com"></div>
          <div class="field"><label>Product Manager name</label><input id="userName" placeholder="Full name"></div>
          <div class="field wide"><label>Linked products</label><select id="userProducts" multiple size="9">${productOptions([])}</select></div>
          <div class="wide btn-row"><button class="primary" id="addUser">Save user access</button></div>
        </div>
      </section>

      <section class="admin-page" id="admin-products">
        <div class="admin-hero-card"><div><span class="admin-kicker">Portfolio</span><h3>Add / update product</h3></div></div>
        <div class="admin-card clean-card form-grid-2">
          <div class="field"><label>Product name</label><input id="prodName" placeholder="Brand name"></div>
          <div class="field"><label>Ingredient definition</label><input id="prodIngredient" placeholder="Molecule / combination"></div>
          <div class="field wide"><label>Molecule groups</label><textarea id="prodMolecules" placeholder="Example: IRBESARTAN | IRBESARTAN+HYDROCHLOROTHIAZIDE"></textarea></div>
          <div class="field"><label>Brand keywords</label><input id="prodKeys" placeholder="Keyword 1, Keyword 2"></div>
          <div class="field"><label>Assign to Product Manager</label><select id="prodOwners" multiple size="5">${managerOptions('')}</select></div>
          <div class="wide btn-row"><button class="primary" id="addProduct">Save product</button></div>
        </div>
      </section>

      <section class="admin-page" id="admin-mapping">
        <div class="admin-hero-card"><div><span class="admin-kicker">Ownership</span><h3>Link products to Product Manager</h3></div></div>
        <div class="admin-card clean-card form-grid-2">
          <div class="field"><label>Product Manager</label><select id="mapManager">${managerOptions(firstManager)}</select></div>
          <div class="field wide"><label>Products</label><select id="mapProducts" multiple size="11">${productOptions(config.managers[firstManager]||[])}</select></div>
          <div class="wide btn-row"><button class="primary" id="saveMapping">Save mapping</button></div>
        </div>
        <div class="admin-card clean-card"><h3 class="compact-title">Current product ownership</h3>${adminMatrixHtml()}</div>
      </section>

      <section class="admin-page" id="admin-console">
        <div class="admin-hero-card"><div><span class="admin-kicker">Firebase</span><h3>Console shortcuts</h3></div></div>
        <div class="admin-shortcuts">
          <a class="admin-shortcut" href="${AUTH_USERS_LINK}" target="_blank"><b>Authentication Users</b><span>Create login users and reset passwords</span></a>
          <a class="admin-shortcut" href="${IAM_LINK}" target="_blank"><b>IAM Members</b><span>Manage Firebase console access</span></a>
        </div>
      </section>
    </main>
  </div>`;
  document.body.appendChild(modal);
  document.getElementById('closeAdmin').onclick=()=>modal.remove();
  document.querySelectorAll('[data-admin-tab]').forEach(btn=>btn.onclick=()=>{
    document.querySelectorAll('.admin-tab-btn').forEach(b=>b.classList.remove('active'));
    document.querySelectorAll('.admin-page').forEach(p=>p.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById('admin-'+btn.dataset.adminTab)?.classList.add('active');
  });
  document.getElementById('clearUploadLog').onclick=()=>{document.getElementById('uploadLog').innerHTML='<div>Ready.</div>'; setUploadProgress(0,'Ready');};
  document.getElementById('uploadIQVIA').onclick=uploadIQVIABundle;
  document.getElementById('mapManager').onchange=e=>{ document.getElementById('mapProducts').innerHTML=productOptions(config.managers[e.target.value]||[]); };
  document.getElementById('saveMapping').onclick=async()=>{
    const manager=document.getElementById('mapManager').value;
    const products=[...document.getElementById('mapProducts').selectedOptions].map(o=>o.value);
    if(!manager) return alert('Choose Product Manager');
    config.managers[manager]=products;
    await saveCloudConfig();
    modal.remove(); renderAdmin();
  };
  document.getElementById('addUser').onclick=async()=>{
    const email=document.getElementById('userEmail').value.trim().toLowerCase();
    const name=document.getElementById('userName').value.trim();
    const products=[...document.getElementById('userProducts').selectedOptions].map(o=>o.value);
    if(!email||!name||!products.length) return alert('Complete email, name and linked products');
    config.users[email]={name,role:'manager'};
    config.managers[name]=products;
    await setDoc(doc(db,'appUsers',email), { email, name, role:'manager', products, updatedAt:serverTimestamp(), updatedBy:state.user.email }, { merge:true });
    await saveCloudConfig();
    modal.remove(); renderAdmin();
  };
  document.getElementById('addProduct').onclick=async()=>{
    const name=document.getElementById('prodName').value.trim();
    const ingredient=document.getElementById('prodIngredient').value.trim();
    const groups=document.getElementById('prodMolecules').value.split('|').map(g=>g.split(/[+,\/]/).map(x=>norm(x)).filter(Boolean)).filter(g=>g.length);
    const keys=document.getElementById('prodKeys').value.split(',').map(x=>norm(x)).filter(Boolean);
    const owners=[...document.getElementById('prodOwners').selectedOptions].map(o=>o.value);
    if(!name||!ingredient||!groups.length||!keys.length) return alert('Complete all product fields');
    config.products[name]={ingredient,moleculeGroups:groups,brandKeywords:keys};
    config.managers.Admin ||= [];
    if(!config.managers.Admin.includes(name)) config.managers.Admin.push(name);
    managerNames().forEach(m=>{
      config.managers[m] ||= [];
      config.managers[m]=config.managers[m].filter(p=>p!==name);
      if(owners.includes(m)) config.managers[m].push(name);
    });
    await saveCloudConfig();
    modal.remove(); renderAdmin();
  };
}
async function uploadIQVIABundle(){
  const input=document.getElementById('iqviaFiles');
  const files=[...(input?.files||[])];
  if(!files.length) return alert('Choose files first');
  if(!window.XLSX) return alert('XLSX library not loaded. Check internet/CDN.');
  const uploadBtn=document.getElementById('uploadIQVIA');
  const clearBtn=document.getElementById('clearUploadLog');
  if(uploadBtn){ uploadBtn.disabled=true; uploadBtn.textContent='Publishing...'; }
  if(clearBtn) clearBtn.disabled=true;
  document.getElementById('uploadLog').innerHTML='';
  setUploadProgress(1,'Preparing monthly update');
  const published=[];
  try{
    let units=[];
    for(const file of files){
      adminLog(`Reading ${esc(file.name)}...`);
      await sleep(25);
      if(file.name.toLowerCase().endsWith('.zip')){
        if(!window.JSZip) throw new Error('JSZip library not loaded.');
        const zip=await JSZip.loadAsync(await file.arrayBuffer());
        for(const [name,obj] of Object.entries(zip.files)){
          if(!obj.dir && /\.xlsx?$/i.test(name)) units.push({name:name.split('/').pop(), getBuffer:()=>obj.async('arraybuffer')});
        }
      }else if(/\.xlsx?$/i.test(file.name)){
        units.push({name:file.name, getBuffer:()=>file.arrayBuffer()});
      }
    }
    if(!units.length) throw new Error('No Excel files found.');
    adminLog(`Found ${units.length} Excel file(s).`,'ok');
    const uploadId = `u_${Date.now()}`;
    for(let i=0;i<units.length;i++){
      const item=units[i];
      const base=(i/units.length)*100;
      setUploadProgress(base,`Reading ${item.name}`);
      adminLog(`Reading workbook ${i+1}/${units.length}: ${esc(item.name)}...`);
      await sleep(40);
      const buffer=await item.getBuffer();
      setUploadProgress(base+8,`Parsing ${item.name}`);
      adminLog(`Parsing and filtering ${esc(item.name)}...`);
      await sleep(40);
      const converted=convertWorkbook(item.name,buffer);
      if(!converted.rows.length){
        adminLog(`Skipped ${esc(item.name)} — no Retail / Medicine Formulas rows detected.`,'error');
        continue;
      }
      cloudIQVIA.data[converted.country] ||= {};
      cloudIQVIA.data[converted.country][converted.period] = { rows: converted.rows };
      setUploadProgress(base+12,`Preparing chunks ${item.name}`);
      const chunks = makeFirestoreChunks(converted.rows, 520000);
      adminLog(`Publishing ${esc(converted.country)}/${esc(converted.period)} as ${chunks.length} Firestore chunk(s).`);
      const fileInfo = await publishFirestoreChunks(converted, chunks, uploadId, (done,total)=>{
        const pct = total ? done/total : 1;
        setUploadProgress(base+16+(pct*76/units.length),`Publishing ${item.name} (${done}/${total})`);
      });
      published.push(fileInfo);
      adminLog(`Published ${esc(item.name)} → ${converted.country}/${converted.period} (${converted.rows.length.toLocaleString()} rows).`,'ok');
      setUploadProgress(((i+1)/units.length)*100,`Done ${item.name}`);
      await sleep(40);
    }
    if(!published.length) throw new Error('No files were published. Check Excel headers, Sector = RETAIL, Formula Type = MEDICINE FORMULAS.');
    setUploadProgress(96,'Updating shared manifest');
    await setDoc(doc(db,'marketingPlan','dataManifest'), { mode:'firestoreChunks', files:published, updatedAt:serverTimestamp(), updatedBy:state.user.email }, { merge:false });
    cloudIQVIA={data:cloudIQVIA.data,sources:published}; DATA_CACHE.clear(); ALL_DATA_CACHE=null;
    setUploadProgress(100,'Published');
    adminLog('Monthly IQVIA update completed. The shared Firebase manifest now points to the new dataset.','ok');
    toast('IQVIA data published');
    render();
  }catch(e){
    console.error(e);
    setUploadProgress(0,'Failed');
    const message = friendlyUploadError(e);
    adminLog(`Error: ${esc(message)}`,'error');
    alert(message);
  }finally{
    if(uploadBtn){ uploadBtn.disabled=false; uploadBtn.textContent='Upload & publish'; }
    if(clearBtn) clearBtn.disabled=false;
  }
}
function makeFirestoreChunks(rows,maxBytes=650000){
  const chunks=[]; let current=[]; let size=2;
  for(const row of rows){
    const rowSize = new Blob([JSON.stringify(row)]).size + 2;
    if(current.length && size + rowSize > maxBytes){ chunks.push(current); current=[]; size=2; }
    current.push(row); size += rowSize;
  }
  if(current.length) chunks.push(current);
  return chunks;
}
async function deleteExistingChunks(dataId){
  const snap = await getDocs(collection(db,'iqviaData',dataId,'chunks'));
  let batch=writeBatch(db), count=0, deleted=0;
  for(const d of snap.docs){
    batch.delete(d.ref); count++; deleted++;
    if(count>=400){ await batch.commit(); batch=writeBatch(db); count=0; }
  }
  if(count) await batch.commit();
  return deleted;
}
async function publishFirestoreChunks(converted,chunks,uploadId,onProgress=()=>{}){
  const dataId = `${converted.country}_${converted.period}`;
  const deleted = await deleteExistingChunks(dataId);
  if(deleted) adminLog(`Removed ${deleted} old chunk(s) for ${esc(converted.country)}/${esc(converted.period)}.`);
  await setDoc(doc(db,'iqviaData',dataId), {
    country: converted.country,
    period: converted.period,
    schema: SCHEMA,
    uploadId,
    chunks: chunks.length,
    rows: converted.rows.length,
    source: converted.source,
    updatedAt: serverTimestamp(),
    updatedBy: state.user.email
  }, { merge:false });
  let batch=writeBatch(db), count=0;
  for(let i=0;i<chunks.length;i++){
    const ref = doc(db,'iqviaData',dataId,'chunks',String(i).padStart(5,'0'));
    const packedRows = chunks[i].map(r=>({ v:r }));
    batch.set(ref,{ index:i, rows:packedRows, count:chunks[i].length, uploadId, storageFormat:'array-of-maps-v1', createdAt:serverTimestamp() });
    count++;
    if(count>=50){ await batch.commit(); batch=writeBatch(db); count=0; onProgress(i+1,chunks.length); await sleep(10); }
  }
  if(count) await batch.commit();
  onProgress(chunks.length,chunks.length);
  return { country:converted.country, period:converted.period, mode:'firestoreChunks', dataId, chunks:chunks.length, rows:converted.rows.length, source:converted.source, updatedAt:new Date().toISOString() };
}
function friendlyUploadError(e){
  const msg=String(e?.message||e||''); const code=String(e?.code||'');
  if(code.includes('permission-denied') || msg.includes('permission-denied')) return 'Upload failed: Firebase Firestore rules blocked this action. Make sure the admin email is allowed to write to Firestore.';
  if(code.includes('unavailable') || msg.includes('offline')) return 'Upload failed: Firebase connection interrupted. Check internet connection and try again.';
  if(code.includes('resource-exhausted')) return 'Upload failed: Firestore quota/limits reached. This file is too large for the current monthly upload limits; try uploading fewer files at a time.';
  if(msg.includes('Nested arrays are not supported')) return 'Upload failed: Firestore rejected nested arrays. Please use V8, which stores rows as map-wrapped records instead of direct arrays.';
  if(code.includes('storage/retry-limit-exceeded') || msg.includes('retry-limit-exceeded')) return 'Upload failed on Firebase Storage. This version avoids Storage and publishes IQVIA data in Firestore chunks; refresh and try again using V7.';
  return 'Upload failed: '+msg;
}
function convertWorkbook(name,buffer){ const wb=XLSX.read(buffer,{type:'array'}); const ws=wb.Sheets[wb.SheetNames[0]]; const rows=XLSX.utils.sheet_to_json(ws,{defval:''}); const country=inferCountry(name,rows[0]||{}); const period=/YTD/i.test(name)?'YTD':(/MAT/i.test(name)?'MAT':'MAT'); const out=[]; let total=0, kept=0, excludedNonRetail=0, excludedFormula=0; for(const r of rows){ total++; const sector=String(r['Sector']||'').trim().toUpperCase(); const formula=String(r['Formula Type']||'').trim().toUpperCase(); if(sector!=='RETAIL'){excludedNonRetail++; continue;} if(formula!=='MEDICINE FORMULAS'){excludedFormula++; continue;} kept++; out.push(['Anatomical Therapeutic Chemical','ATC2','ATC3','ATC4','Molecule List','Products','Manufacturer','SKU','Pack','NFC','PY1 USD','CY USD','PY1 Unit','CY Unit','PY2 USD','PY2 Unit','Company Brand','Strength','By Dosage','Brand Name','Month'].map(k=>['PY1 USD','CY USD','PY1 Unit','CY Unit','PY2 USD','PY2 Unit'].includes(k)?num(r[k]):(r[k]||''))); } return {country,period,rows:out,source:{file:name,country,period,totalRows:total,keptRetailMedicineRows:kept,excludedNonRetailRows:excludedNonRetail,excludedOtherFormulaRows:excludedFormula}}; }
function inferCountry(name,row){ const n=name.toUpperCase(); if(n.includes('KSA')) return 'KSA'; if(n.includes('UAE')) return 'UAE'; if(n.includes('IRQ')||n.includes('IRAQ')) return 'IRQ'; if(n.includes('ALG')||n.includes('ALGERIA')) return 'ALG'; if(n.includes('JO')||n.includes('JORDAN')) return 'JO'; const c=String(row.Country||'').toUpperCase(); if(c.includes('SAUDI')) return 'KSA'; if(c.includes('EMIRATES')) return 'UAE'; if(c.includes('IRAQ')) return 'IRQ'; if(c.includes('ALGERIA')) return 'ALG'; return 'JO'; }
function num(v){ const n=Number(String(v||0).replace(/,/g,'')); return isFinite(n)?Math.round(n*10000)/10000:0; }



async function downloadPpt(){
  if(!window.html2canvas){
    alert('PowerPoint visual export needs html2canvas. Please check internet connection or add html2canvas locally.');
    return;
  }

  const oldText = document.getElementById('downloadPpt')?.textContent;
  const btn = document.getElementById('downloadPpt');
  if(btn){ btn.disabled=true; btn.textContent='Building dashboard-exact PowerPoint...'; }

  try{
    const pptx = new window.PptxGenJS();
    pptx.layout='LAYOUT_WIDE';
    pptx.author='Dar Aldawa';
    pptx.company='Dar Aldawa';
    pptx.subject='Marketing Plan 2026';
    pptx.title=`Marketing Plan 2026 - ${state.product} - ${state.country}`;
    pptx.theme = {
      headFontFace:'Aptos Display',
      bodyFontFace:'Aptos',
      lang:'en-US'
    };

    const models=slideModels();
    const stage=document.createElement('div');
    stage.className='ppt-export-stage';
    stage.setAttribute('style', countryStyle());
    document.body.appendChild(stage);

    for(let i=0;i<models.length;i++){
      const model=models[i];
      const html=state.overrides[slideKey(i)] || safeModelHtml(model);
      stage.innerHTML = `<section class="slide ${model.cls||''}" id="ppt-export-slide-${i}">
        <div class="flag-strip"></div>
        <div class="slide-header-flag"><span>${country().flag}</span><b>${esc(state.country)}</b></div>
        <div class="slide-watermark">Dar Aldawa • Years of Excellence</div>
        <div class="slide-no">${i+1}</div>
        <div class="slide-body">${html}</div>
      </section>`;

      const el=stage.querySelector('.slide');
      await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));

      const canvas=await html2canvas(el,{
        backgroundColor:'#ffffff',
        scale:2,
        useCORS:true,
        allowTaint:true,
        logging:false,
        width:1200,
        height:675,
        windowWidth:1200,
        windowHeight:675
      });

      const slide=pptx.addSlide();
      slide.background={color:'FFFFFF'};
      slide.addImage({data:canvas.toDataURL('image/png',0.96),x:0,y:0,w:13.333,h:7.5});

      // Add an invisible editable text layer for search/copy without changing the exact visual look.
      const plain=cleanText(el.innerText||'');
      if(plain){
        slide.addText(plain,{x:0.05,y:0.05,w:0.01,h:0.01,fontSize:1,color:'FFFFFF',transparency:100});
      }
    }

    stage.remove();
    await pptx.writeFile({ fileName:`Marketing Plan 2026 - ${state.product} - ${state.country} - dashboard exact.pptx` });
    toast('Dashboard-exact PowerPoint exported');
  } catch(e){
    console.error(e);
    alert('PowerPoint export failed: '+(e?.message||e));
  } finally {
    if(btn){ btn.disabled=false; btn.textContent=oldText||'Download editable PowerPoint'; }
  }
}

function drawPptFrame(pptx,slide,no){
  slide.background={color:'FFFFFF'};
  slide.addShape(pptx.ShapeType.rect,{x:0,y:0,w:5.25,h:.06,fill:{color:'062B3D'},line:{color:'062B3D'}});
  slide.addShape(pptx.ShapeType.rect,{x:5.25,y:0,w:3.15,h:.06,fill:{color:'00A08C'},line:{color:'00A08C'}});
  slide.addShape(pptx.ShapeType.rect,{x:8.4,y:0,w:4.933,h:.06,fill:{color:'D7B56D'},line:{color:'D7B56D'}});
  slide.addText('Dar Aldawa • 30 Years of Excellence',{x:9.25,y:.18,w:3.55,h:.2,fontSize:7.2,color:'64748B',bold:true,align:'right'});
  slide.addText(String(no),{x:12.72,y:7.1,w:.25,h:.16,fontSize:7,color:'64748B'});
}
function pptCover(slide){ slide.addText('Marketing Plan 2026',{x:.65,y:2.95,w:6.4,h:.55,fontSize:31,bold:true,color:'062B3D'}); slide.addText(`Prepared by: ${preparedByName()}`,{x:.67,y:3.62,w:5.2,h:.28,fontSize:14,color:'64748B'}); }
function pptBrandCountry(slide){ slide.addText(`${state.product}`,{x:.72,y:2.75,w:7.5,h:.5,fontSize:31,bold:true,color:'062B3D'}); slide.addText(`${productDef().ingredient}`,{x:.74,y:3.28,w:7.2,h:.3,fontSize:16,color:'64748B'}); slide.addText(`${country().label}`,{x:.74,y:3.68,w:5.5,h:.3,fontSize:18,color:'102A3A'}); }
function addPptTable(slide, tableEl){
  const tableData=[...tableEl.rows].map(r=>[...r.cells].map(c=>cleanText(c.innerText)));
  const colCount=tableData[0]?.length||1;
  const isWide=colCount>10;
  let fontSize=isWide?4.7:(colCount>7?6.4:8.2);
  let y=1.05, h=isWide?4.75:4.35;
  slide.addTable(tableData,{x:.38,y,w:12.45,h,border:{type:'solid',color:'BFD9D5',pt:.35},fontSize,color:'102A3A',margin:.025,fit:'shrink',fill:'FFFFFF',autoFit:false, valign:'mid'});
}
function addPptComments(slide,tmp){
  const grid=[...tmp.querySelectorAll('.comment-grid div')].map(d=>cleanText(d.innerText)).filter(Boolean).join('\n');
  const c=grid || cleanText(tmp.querySelector('.comment-text')?.innerText||tmp.querySelector('.comments-box')?.innerText||'');
  const ref=cleanText(tmp.querySelector('.reference-label')?.innerText||'Reference');
  if(ref) slide.addText(ref,{x:.55,y:5.88,w:4.2,h:.18,fontSize:7.5,color:'64748B'});
  if(c) slide.addText(c,{x:.55,y:6.08,w:11.65,h:.82,fontSize:7.4,color:'102A3A',fit:'shrink',margin:.05,fill:{color:'F6FBFB'},line:{color:'0AA38F',pt:.6}});
}
function addPptContent(slide,tmp){ const txt=cleanText([...tmp.querySelectorAll('p,li,h3,.strategy-statement,.empty-box,.health-node')].map(x=>x.innerText).filter(Boolean).join('\n')); slide.addText(txt||' ',{x:.72,y:1.15,w:11.9,h:5.3,fontSize:13,color:'102A3A',fit:'shrink',breakLine:false}); }
function cleanText(s){return String(s||'').replace(/\s+/g,' ').replace(/\n /g,'\n').trim();}

function runDeckSelfTest(){
  const models=slideModels();
  const errors=[];
  models.forEach((m,i)=>{
    try{ safeModelHtml(m); }
    catch(e){ errors.push({i:i+1,title:m.title,error:e?.message||String(e)}); }
  });
  console.table(errors);
  return {slides:models.length, errors};
}

function toast(msg){ const t=document.createElement('div'); t.className='toast'; t.textContent=msg; document.body.appendChild(t); setTimeout(()=>t.remove(),2800); }
