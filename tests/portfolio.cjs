/* Browser-DOM integration tests. Run npm install then npm test. */
const {JSDOM} = require('jsdom');
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
const seed = JSON.parse(fs.readFileSync(path.join(root, 'data/eois.json'), 'utf8'));
let checks = 0;
function check(value, message) { checks++; assert.ok(value, message); }
async function page(name, storage) {
  const dom = new JSDOM(fs.readFileSync(path.join(root, name+'.html'), 'utf8'), {url:'https://example.test/assignment3/'+name+'.html',runScripts:'outside-only'});
  const w=dom.window;
  w.structuredClone=structuredClone;
  w.fetch=async () => ({ok:true,json:async()=>structuredClone(seed)});
  if(storage)w.localStorage.setItem('datasource.portfolio.assignment3.eois.v1',storage);
  const errors=[];
  w.addEventListener('error',e=>errors.push(e.error));
  for(const file of ['apply.js','portfolio.js'])w.eval(fs.readFileSync(path.join(root,'scripts',file),'utf8'));
  // JSDOM fires DOMContentLoaded once automatically after construction.
  await new Promise(resolve=>w.setTimeout(resolve,25));
  assert.deepEqual(errors,[]);
  return dom;
}
(async()=>{
  const apply=await page('apply');const w=apply.window;const form=w.document.getElementById('application-form');
  const fixture={jobReference:'A1234',firstName:'Alex',lastName:'Taylor',dateOfBirth:'22/10/2000',streetAddress:'1 Example Street',suburbTown:'Melbourne',state:'VIC',postcode:'3000',email:'alex@example.com',phone:'0400 000 000',otherSkills:'Example skill'};
  for(const [key,value] of Object.entries(fixture))form.elements.namedItem(key).value=value;
  form.elements.namedItem('gender').value='Non Binary';form.elements.namedItem('networking').checked=true;
  const event=new w.Event('submit',{cancelable:true,bubbles:true});form.dispatchEvent(event);
  check(event.defaultPrevented,'Static submission never leaves page');
  const key='datasource.portfolio.assignment3.eois.v1';
  let stored=JSON.parse(w.localStorage.getItem(key));check(stored.length===4,'Application appended to JSON-derived records');
  check(stored[3].Status==='New' && stored[3].EOInumber===4,'Unique EOI and default status');
  check(w.document.getElementById('demo-outcome').textContent.includes('EOI number is 4'),'Visible confirmation');
  form.elements.namedItem('dateOfBirth').value='31/02/2000';form.dispatchEvent(new w.Event('submit',{cancelable:true}));
  check(JSON.parse(w.localStorage.getItem(key)).length===4,'Invalid calendar date cannot insert');
  const manage=await page('manage',JSON.stringify(stored));const m=manage.window;const doc=m.document;
  check(doc.querySelectorAll('#eoi-rows tr').length===4,'Records persist on management page');
  const filters=doc.getElementById('manager-filters');filters.elements.namedItem('jobReference').value='A1234';filters.dispatchEvent(new m.Event('submit',{cancelable:true}));
  check(doc.querySelectorAll('#eoi-rows tr').length===1,'Job filter');
  const status=doc.querySelector('#eoi-rows select');status.value='Final';status.form.dispatchEvent(new m.Event('submit',{cancelable:true}));
  check(JSON.parse(m.localStorage.getItem(key))[3].Status==='Final','Status mutation persists');
  filters.reset();await new Promise(resolve=>m.setTimeout(resolve,10));
  filters.elements.namedItem('sort').value='firstName';filters.elements.namedItem('direction').value='DESC';filters.dispatchEvent(new m.Event('submit',{cancelable:true}));
  check(doc.querySelector('#eoi-rows tr').textContent.includes('Sam Morgan'),'Descending sort');
  filters.elements.namedItem('firstName').value='Alex';filters.elements.namedItem('lastName').value='Taylor';filters.dispatchEvent(new m.Event('submit',{cancelable:true}));
  check(doc.querySelectorAll('#eoi-rows tr').length===2,'First and last name filters');
  const del=doc.getElementById('delete-applications');del.elements.namedItem('jobReference').value='A1234';del.elements.namedItem('confirmed').checked=true;del.dispatchEvent(new m.Event('submit',{cancelable:true}));
  check(JSON.parse(m.localStorage.getItem(key)).length===3,'Delete by reference');
  doc.getElementById('reset-demo').click();check(JSON.parse(m.localStorage.getItem(key)).length===3,'Reset restores seed');
  stored=structuredClone(seed);stored[0].firstName='<img src=x onerror=alert(1)>';
  const hostile=await page('manage',JSON.stringify(stored));check(!hostile.window.document.querySelector('#eoi-rows img'),'Records rendered with textContent, no HTML injection');
  form.reset();await new Promise(resolve=>w.setTimeout(resolve,10));check(form.elements.namedItem('firstName').value==='','Reset clears applicant values');
  for(const dom of [apply,manage,hostile])dom.window.close();
  console.log(`${checks} portfolio DOM checks passed.`);
})().catch(error=>{console.error(error);process.exitCode=1;});
