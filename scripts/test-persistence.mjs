// Run against the dedicated demo project: node --env-file=.env.local scripts/test-persistence.mjs
import assert from 'node:assert/strict';
const url=process.env.SUPABASE_URL,key=process.env.SUPABASE_SECRET_KEY;
if(!url||!key)throw new Error('Missing Supabase configuration');
const headers={apikey:key,'Content-Type':'application/json'};
if(!key.startsWith('sb_secret_'))headers.Authorization=`Bearer ${key}`;
const call=(path,method='GET',body)=>fetch(`${url}/rest/v1/${path}`,{method,headers:{...headers,Prefer:'return=representation'},...(body?{body:JSON.stringify(body)}:{})});
const day=new Intl.DateTimeFormat('en-CA',{timeZone:'America/Argentina/Tucuman',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date(Date.now()+7*86400000));
const args={venue_id:'venue-cancha-manager-demo',court_id:'court-f5-2',starts_at:`${day}T09:00:00-03:00`,ends_at:`${day}T10:00:00-03:00`,price_ars:18000};
let held,customer;
try {
 const responses=await Promise.all([call('rpc/cm_create_hold','POST',args),call('rpc/cm_create_hold','POST',args)]);
 assert.equal(responses.filter(r=>r.ok).length,1,'Only one simultaneous hold must succeed');
 const rejected=responses.find(r=>!r.ok);assert.equal((await rejected.json()).code,'23P01');
 held=await responses.find(r=>r.ok).json();
 const [persisted]=await(await call(`cm_reservations?id=eq.${held.id}`)).json();assert.equal(persisted.status,'hold');
 const invalid=await call('rpc/cm_create_hold','POST',{...args,starts_at:`${day}T10:00:00-03:00`,ends_at:`${day}T10:10:00-03:00`});assert.equal(invalid.ok,false,'Reject invalid slot duration');
 const complete=await call('rpc/cm_complete_reservation','POST',{reservation_id:held.id,customer:{fullName:'Prueba automatizada',email:'qa@example.com',phoneE164:'5493815551234'},payment:'cash',receipt_name:null,receipt_path:null,customer_notes:'Disposable test'});
 assert.equal(complete.ok,true);const reservation=await complete.json();customer=reservation.customerId;assert.equal(reservation.status,'pending');
 const duplicate=await call('rpc/cm_complete_reservation','POST',{reservation_id:held.id,customer:{},payment:'cash',receipt_name:null,receipt_path:null,customer_notes:null});assert.equal(duplicate.ok,false,'Cannot complete a reservation twice');
 const [again]=await(await call(`cm_reservations?id=eq.${held.id}`)).json();assert.equal(again.customerId,customer);assert.equal(again.status,'pending');
 console.log('Persistence, concurrent holds, slot validation and reservation lifecycle passed');
} finally {
 if(held)assert.equal((await call(`cm_reservations?id=eq.${held.id}`,'DELETE')).ok,true);
 if(customer)assert.equal((await call(`cm_customers?id=eq.${customer}`,'DELETE')).ok,true);
}
