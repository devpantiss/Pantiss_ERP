export const statuses = ['Idea', 'Drafting', 'In review', 'Approved', 'Published'] as const;
export type ContentStatus = typeof statuses[number];
export const channels = ['LinkedIn', 'Instagram', 'Website', 'Newsletter', 'Press'];
export const thematicAreas = ['Skill development', 'Livelihood', 'Entrepreneurship', 'Health', 'Climate change'];
export interface ContentItem { id:string; title:string; campaign:string; channel:string; theme:string; owner:string; date:string; status:ContentStatus; brief:string; checklist:boolean[]; reach:number; engagements:number; history:string[] }
export interface Campaign { id:string; title:string; description:string; theme:string; target:number; start:string; end:string }
export interface Contact { id:string; name:string; organization:string; category:string; owner:string; next:string; date:string; done:boolean }
export interface Coverage { id:string; title:string; outlet:string; date:string; sentiment:'Positive'|'Neutral'; theme:string; notes:string }
export interface CommsData { content:ContentItem[]; campaigns:Campaign[]; contacts:Contact[]; coverage:Coverage[] }
export const initialData:CommsData = {
 campaigns:[
 {id:'CP-01',title:'Skills that change futures',description:'Youth stories, employer voices and training outcomes from Odisha.',theme:'Skill development',target:100000,start:'2026-10-01',end:'2026-11-30'},
 {id:'CP-02',title:'Her enterprise, her future',description:'Make women-led enterprises and local market opportunities visible.',theme:'Entrepreneurship',target:60000,start:'2026-10-15',end:'2026-12-15'},
 {id:'CP-03',title:'Resilient communities',description:'Share community-led climate and livelihood solutions.',theme:'Climate change',target:40000,start:'2026-10-01',end:'2026-12-31'},
 ],
 content:[
 {id:'CM-201',title:'From training to her first job: Meet Sunita',campaign:'CP-01',channel:'LinkedIn',theme:'Skill development',owner:'Ananya Das',date:'2026-10-30',status:'In review',brief:'A beneficiary story about the transition from classroom learning to employment. Include verified placement outcomes and a consented portrait.',checklist:[true,true,false],reach:0,engagements:0,history:['28 Oct · Draft submitted for editorial review']},
 {id:'CM-202',title:'Inside our rural enterprise accelerator',campaign:'CP-02',channel:'Instagram',theme:'Entrepreneurship',owner:'Sneha Patnaik',date:'2026-10-31',status:'Approved',brief:'A photo carousel introducing the programme and women-led businesses. Close with a clear programme contact.',checklist:[true,true,true],reach:0,engagements:0,history:['28 Oct · Editorial review completed']},
 {id:'CM-203',title:'October impact: A month of possibilities',campaign:'CP-01',channel:'Newsletter',theme:'Skill development',owner:'Rohan Nayak',date:'2026-11-02',status:'Drafting',brief:'Monthly programme updates for partners, funders and supporters. Verify all figures with the monitoring team.',checklist:[false,true,false],reach:0,engagements:0,history:['27 Oct · Monthly brief created']},
 {id:'CM-204',title:'A greener future, led by communities',campaign:'CP-03',channel:'Website',theme:'Climate change',owner:'Ananya Das',date:'2026-11-04',status:'Idea',brief:'An editorial feature on climate-resilient villages, community participation and local solutions.',checklist:[false,false,false],reach:0,engagements:0,history:['26 Oct · Story idea added']},
 {id:'CM-205',title:'Youth skills programme reaches a new milestone',campaign:'CP-01',channel:'Press',theme:'Skill development',owner:'Rohan Nayak',date:'2026-11-05',status:'In review',brief:'Prepare a media note highlighting programme outcomes. Obtain spokesperson approval before distribution.',checklist:[true,true,false],reach:0,engagements:0,history:['28 Oct · Media note sent for review']},
 {id:'CM-206',title:'New skills. New confidence. New beginnings.',campaign:'CP-01',channel:'LinkedIn',theme:'Skill development',owner:'Ananya Das',date:'2026-10-22',status:'Published',brief:'A programme highlights post with verified learning outcomes.',checklist:[true,true,true],reach:42600,engagements:1840,history:['22 Oct · Publication recorded manually']},
 {id:'CM-207',title:'Small businesses, extraordinary ambition',campaign:'CP-02',channel:'Instagram',theme:'Entrepreneurship',owner:'Sneha Patnaik',date:'2026-10-24',status:'Published',brief:'A visual series celebrating community entrepreneurs.',checklist:[true,true,true],reach:28400,engagements:2120,history:['24 Oct · Publication recorded manually']},
 {id:'CM-208',title:'Local solutions for a changing climate',campaign:'CP-03',channel:'Website',theme:'Climate change',owner:'Rohan Nayak',date:'2026-10-25',status:'Published',brief:'Community-led climate action feature.',checklist:[true,true,true],reach:12300,engagements:380,history:['25 Oct · Publication recorded manually']},
 ],
 contacts:[
 {id:'SC-01',name:'Meera Sen',organization:'CSR partner network',category:'Partner',owner:'Ananya Das',next:'Share the October programme highlights',date:'2026-10-30',done:false},
 {id:'SC-02',name:'Arjun Rao',organization:'Regional media desk',category:'Media',owner:'Rohan Nayak',next:'Confirm spokesperson interview availability',date:'2026-11-02',done:false},
 {id:'SC-03',name:'Kavita Pradhan',organization:'Community enterprise collective',category:'Community',owner:'Sneha Patnaik',next:'Collect feedback on the enterprise story series',date:'2026-11-04',done:false},
 ],
 coverage:[
 {id:'MC-01',title:'Local youth build pathways to employment',outlet:'Sample regional daily',date:'2026-10-23',sentiment:'Positive',theme:'Skill development',notes:'Programme milestone feature. Sample clipping record; no live media link.'},
 {id:'MC-02',title:'Women entrepreneurs connect with new markets',outlet:'Sample development journal',date:'2026-10-25',sentiment:'Positive',theme:'Entrepreneurship',notes:'Community enterprise spotlight. Sample clipping record.'},
 {id:'MC-03',title:'Community workshop explores climate solutions',outlet:'Sample community bulletin',date:'2026-10-27',sentiment:'Neutral',theme:'Climate change',notes:'Workshop announcement and programme summary. Sample clipping record.'},
 ]
};
export const checklistLabels=['Facts & outcomes verified','Consent & asset rights checked','Editorial approval recorded'];
export const compact=(n:number)=>new Intl.NumberFormat('en-IN',{notation:'compact',maximumFractionDigits:1}).format(n);
export function loadData():CommsData {try{const d=JSON.parse(localStorage.getItem('pantiss:communications:v1')||'null');if(d&&Array.isArray(d.content)&&Array.isArray(d.campaigns)&&Array.isArray(d.contacts)&&Array.isArray(d.coverage)&&d.content.every((x:ContentItem)=>x.id&&statuses.includes(x.status)&&Array.isArray(x.checklist)&&Array.isArray(x.history)&&Number.isFinite(x.reach)&&Number.isFinite(x.engagements)))return d;}catch{/* Fall back to the labeled demo portfolio. */}return initialData;}
