const gosVouchers = [
    {name: "No Voucher", val: 0}, {name: "A (£42.40)", val: 42.40}, {name: "B (£64.26)", val: 64.26},
    {name: "C (£94.14)", val: 94.14}, {name: "D (£212.40)", val: 212.40}, {name: "E (£73.10)", val: 73.10},
    {name: "F (£92.72)", val: 92.72}, {name: "G (£120.48)", val: 120.48}, {name: "H (£233.56)", val: 233.56}
];

const data = {
    frames: [
        {name:"£15",price:15}, {name:"£30",price:30}, {name:"£50",price:50}, 
        {name:"£70",price:70}, {name:"£90",price:90}, {name:"£100",price:100}, 
        {name:"£130",price:130}, {name:"£150",price:150}, {name:"£170",price:170}, 
        {name:"£170 Rimless",price:170}, {name:"£40 Reglaze", price:40}
    ],
    lenses: [
        {name:"Standard Single Vision", price:0, cat:"sv", type:"std"},
        {name:"SuperSingle Vision", price:65, cat:"sv", type:"super"},
        {name:"SuperBoost", price:65, cat:"sv", type:"super"},
        {name:"SuperDigital Varifocal", price:220, cat:"var-spec", type:"super"},
        {name:"SuperDrive Varifocal", price:220, cat:"var-spec", type:"super"},
        {name:"Tailormade Varifocal", price:180, cat:"var-core", type:"std"},
        {name:"Elite Varifocal", price:140, cat:"var-core", type:"std"},
        {name:"Premium Varifocal", price:90, cat:"var-core", type:"std"},
        {name:"Standard Varifocal", price:40, cat:"var-core", type:"std"},
        {name:"SuperReader 1/2/3", price:135, cat:"mixed", type:"super"},
        {name:"Premium Occupational", price:80, cat:"mixed", type:"std"},
        {name:"Premium Bifocal", price:60, cat:"mixed", type:"std"},
        {name:"Standard Bifocal", price:50, cat:"mixed", type:"std"}
    ],
    treatments: [
        {name:"UltraClear SuperClean", price:40, cat:"main"},
        {name:"Reactions (Brn/Gry)", price:70, cat:"main"},
        {name:"Polarised (Brn/Grn/Gry)", price:70, cat:"main"},
        {name:"Mirror Tint (Incl UCSC)", price:60, cat:"main"},
        {name:"Tint & UV Protection", price:30, cat:"main"},
        {name:"UV400 Protection (Clear)", price:15, cat:"main"},
        {name:"UltraDrive (Day/Night)", price:30, cat:"main"},
        {name:"Ultimate Thin (1.74)", price:140, cat:"thin"},
        {name:"Super Thin (1.67)", price:100, cat:"thin"},
        {name:"Extra Thin (1.6)", price:60, cat:"thin"},
        {name:"Aspheric Lenses (1.5)", price:25, cat:"thin"}
    ]
};

let pairs = [{ frame: null, lens: null, upgrades: [] }, { frame: null, lens: null, upgrades: [] }];
let activeIdx = 0;
let supplements = { complex: 0, tint: 0, prism: 0 };

function populateVouchers() {
    const v0 = document.getElementById('voucher-0'), v1 = document.getElementById('voucher-1');
    gosVouchers.forEach(v => { const opt = `<option value="${v.val}">${v.name}</option>`; v0.innerHTML += opt; v1.innerHTML += opt; });
}

function toggleSupp(type) {
    const vals = { complex: 39.10, tint: 4.60, prism: 13.10 };
    supplements[type] = supplements[type] === 0 ? vals[type] : 0;
    document.getElementById(`supp-${type}`).classList.toggle('active', supplements[type] > 0);
    renderAll();
}

function checkConflicts(name, type, p) {
    if (!p || !p.lens) return false;
    const selNames = p.upgrades.map(u => u.name);
    const isBifocal = p.lens.name.includes("Bifocal");
    const isPremiumBifocal = p.lens.name === "Premium Bifocal";
    const isMixed = p.lens.cat === 'mixed';
    const isSuper = p.lens.type === 'super';
    const highThinSelected = p.upgrades.some(u => ["Extra Thin (1.6)", "Super Thin (1.67)", "Ultimate Thin (1.74)"].includes(u.name));

    if (name === "Aspheric Lenses (1.5)") {
        if (p.lens.name !== "Standard Single Vision") return true;
        if (selNames.some(n => ["Extra Thin (1.6)", "Super Thin (1.67)", "Ultimate Thin (1.74)", "Polarised (Brn/Grn/Gry)", "Reactions (Brn/Gry)"].includes(n))) return true;
    }
    
    if (isPremiumBifocal) {
        if (["Reactions (Brn/Gry)", "Polarised (Brn/Grn/Gry)", "Extra Thin (1.6)", "Super Thin (1.67)", "Ultimate Thin (1.74)", "Aspheric Lenses (1.5)"].includes(name)) return true;
    }
    if (isBifocal && !isPremiumBifocal) {
        if (["Super Thin (1.67)", "Ultimate Thin (1.74)"].includes(name)) return true;
        const bifocalConflictGroup = ["Extra Thin (1.6)", "Reactions (Brn/Gry)", "Polarised (Brn/Grn/Gry)"];
        if (bifocalConflictGroup.includes(name)) return selNames.some(n => bifocalConflictGroup.includes(n) && n !== name);
    }

    if ((name === "Mirror Tint (Incl UCSC)" || name === "UltraDrive (Day/Night)") && (isMixed || isBifocal)) return true;
    if (name === "UltraClear SuperClean" && (isSuper || highThinSelected)) return true;

    const tintGroup = ["Reactions (Brn/Gry)", "Polarised (Brn/Grn/Gry)", "Mirror Tint (Incl UCSC)"];
    const highThinGroup = ["Extra Thin (1.6)", "Super Thin (1.67)", "Ultimate Thin (1.74)"];

    if (selNames.includes("Ultimate Thin (1.74)") && tintGroup.includes(name)) return true;
    if (name === "Ultimate Thin (1.74)" && selNames.some(n => tintGroup.includes(n))) return true;

    if (name === "UV400 Protection (Clear)") {
        if (selNames.some(n => tintGroup.includes(n) || highThinGroup.includes(n))) return true;
    }
    if (highThinGroup.includes(name) && selNames.includes("UV400 Protection (Clear)")) return true;

    const uvGroup = [...tintGroup, "Tint & UV Protection", "UltraDrive (Day/Night)", "UV400 Protection (Clear)"];
    if (uvGroup.includes(name)) {
        const currentUV = selNames.filter(n => uvGroup.includes(n));
        if (name === "Polarised (Brn/Grn/Gry)") return currentUV.some(n => !["Mirror Tint (Incl UCSC)", "Polarised (Brn/Grn/Gry)"].includes(n));
        if (name === "Mirror Tint (Incl UCSC)") return currentUV.some(n => !["Polarised (Brn/Grn/Gry)", "Mirror Tint (Incl UCSC)"].includes(n));
        if (currentUV.length > 0 && !currentUV.includes(name)) return true;
    }
    return false;
}

function handleSelection(type, name, cat) {
    let p = pairs[activeIdx];
    if(type === 'frame') p.frame = p.frame?.name === name ? null : {...data.frames.find(f => f.name === name)};
    else if(type === 'lens') p.lens = p.lens?.name === name ? null : {...data.lenses.find(l => l.name === name)};
    else if(type === 'upgrade') {
        let idx = p.upgrades.findIndex(u => u.name === name);
        if(idx > -1) p.upgrades.splice(idx, 1);
        else {
            if(cat === 'thin') p.upgrades = p.upgrades.filter(u => u.cat !== 'thin');
            p.upgrades.push({...data.treatments.find(t => t.name === name)});
        }
    }
    p.upgrades = p.upgrades.filter(u => !checkConflicts(u.name, 'upgrade', p));
    renderAll();
}

function calculate() {
    let runningTotal = 0, totalSavings = 0;
    const offer = document.getElementById('offer-selector').value;
    const vVal = (parseFloat(document.getElementById('voucher-0').value)||0) + (parseFloat(document.getElementById('voucher-1').value)||0) + supplements.complex + supplements.tint + supplements.prism;

    const isReglaze2for1 = (offer === 'reglaze2for1' && pairs[0].frame?.name === "£40 Reglaze" && pairs[1].frame?.name === "£40 Reglaze");
    const isStandard2for1 = (offer === '2for1' && pairs[0].frame?.price >= 70);

    let costs = pairs.map((p, i) => {
        if(!p.frame || !p.lens) return { f:0, l:0, u:0, total:0, isSuper:false };
        let uP = 0;
        const hasHighThin = p.upgrades.some(u => ["Extra Thin (1.6)", "Super Thin (1.67)", "Ultimate Thin (1.74)"].includes(u.name));
        p.upgrades.forEach(u => {
            let c = u.price;
            if(p.frame.name.includes("Rimless") && u.cat === 'thin' && u.name !== "Aspheric Lenses (1.5)") c -= 60;
            else if(p.lens.type === 'super' && u.cat === 'thin' && u.name !== "Aspheric Lenses (1.5)") c -= 40;
            if(u.name === "Tint & UV Protection" && hasHighThin) c -= 15;
            uP += c;
        });

        let fPrice = p.frame.price;
        if (isReglaze2for1) fPrice = (i === 0) ? 40 : 30; 
        
        return { f: fPrice, l: p.lens.price, u: uP, total: fPrice+p.lens.price+uP, isSuper: p.lens.type==='super' };
    });

    if ((isStandard2for1 || isReglaze2for1) && pairs[1].lens && pairs[1].frame) {
        let frameSaving = 0;
        if (isStandard2for1) {
            frameSaving = Math.min(costs[0].f, costs[1].f);
        } else if (isReglaze2for1) {
            frameSaving = 10;
        }

        let lensSaving = 0;
        const pairToDiscount = costs[0].l <= costs[1].l ? 0 : 1;
        if (pairs[pairToDiscount].lens.type === 'super') {
            lensSaving = Math.max(0, costs[pairToDiscount].l - 40);
        } else {
            lensSaving = costs[pairToDiscount].l;
        }

        totalSavings = frameSaving + lensSaving;
        runningTotal = (costs[0].total + costs[1].total) - totalSavings;
    } else {
        pairs.forEach((p, i) => {
            if(!p.frame || !p.lens) return;
            let net = costs[i].total;
            const offerValid = (offer === 'none' || offer === 'unlimited' || (pairs[0].frame?.price >= 70) || (offer==='reglaze2for1' && pairs[0].frame?.name === "£40 Reglaze"));
            
            if(offerValid && i === 0) {
                if(offer==='unlimited') { net -= Math.min(costs[i].f, 50); totalSavings += Math.min(costs[i].f, 50); if(p.lens.name.includes("Standard Varifocal")){net-=40; totalSavings+=40;}}
                else if(offer==='unlimitedplus') { net -= (50 + Math.min(40, costs[i].l+costs[i].u)); totalSavings += (50 + Math.min(40, costs[i].l+costs[i].u)); }
                else if(offer==='goldenticket') { totalSavings += net*0.5; net *= 0.5; }
                else if(offer==='discount40') { let d = Math.min(40, costs[i].l+costs[i].u); net -= d; totalSavings += d; }
                else if(offer==='student') { totalSavings += net*0.25; net *= 0.75; }
                else if(offer==='over60') { totalSavings += net*0.2; net *= 0.8; }
            }
            runningTotal += net;
        });
        const generalBothReglaze = (pairs[0].frame?.name === "£40 Reglaze" && pairs[1].frame?.name === "£40 Reglaze" && offer !== 'reglaze2for1');
        if(generalBothReglaze) { runningTotal -= 10; totalSavings += 10; }
    }
    return { total: Math.max(0, runningTotal - vVal), savings: totalSavings, vTotal: vVal, offerDenied: (offer!=='none' && offer!=='unlimited' && offer!=='reglaze2for1' && (pairs[0].frame?.price || 0) < 70) };
}

function renderGrids() {
    const p = pairs[activeIdx], isSuper = p.lens?.type === 'super', rim = p.frame?.name.includes("Rimless");
    const render = (id, items, type) => {
        let h = '';
        items.forEach(i => {
            let pr = i.price;
            if(rim && i.cat==='thin' && i.name !== "Aspheric Lenses (1.5)") pr -= 60;
            else if(isSuper && i.cat==='thin' && i.name !== "Aspheric Lenses (1.5)") pr -= 40;
            if(i.name === "Tint & UV Protection" && p.upgrades.some(u => ["Extra Thin (1.6)", "Super Thin (1.67)", "Ultimate Thin (1.74)"].includes(u.name))) pr = 15;
            const sel = (type==='upgrade' ? p.upgrades.some(u=>u.name===i.name) : (p[type]?.name===i.name));
            const dis = checkConflicts(i.name, type, p);
            let dName = (type==='frame' && !i.name.includes('Reglaze') && !i.name.includes('Rimless')) ? "<strong>"+i.name+"</strong>" : (i.name+"<br><strong>£"+Math.max(0, pr)+"</strong>");
            h += `<div class="option-card ${sel?'selected':''} ${dis?'disabled':''}" onclick="handleSelection('${type}','${i.name}','${i.cat}')">${dName}</div>`;
        });
        document.getElementById(id).innerHTML = h;
    };
    render('frame-list', data.frames, 'frame');
    render('lens-sv', data.lenses.filter(l=>l.cat==='sv'), 'lens');
    render('lens-var-spec', data.lenses.filter(l=>l.cat==='var-spec'), 'lens');
    render('lens-var-core', data.lenses.filter(l=>l.cat==='var-core'), 'lens');
    render('lens-mixed', data.lenses.filter(l=>l.cat==='mixed'), 'lens');
    render('treat-main', data.treatments.filter(t=>t.cat==='main'), 'upgrade');
    render('treat-thin', data.treatments.filter(t=>t.cat==='thin'), 'upgrade');
}

function renderAll() {
    const res = calculate(); const p = pairs[activeIdx];
    renderGrids();
    document.getElementById('tab1').classList.toggle('locked', !pairs[0].lens);
    let msg = '';
    if(!p.frame || !p.lens) msg = `⚠️ Selection incomplete`;
    else if (p.frame?.name.includes("Rimless") && !p.upgrades.some(u => ["Extra Thin (1.6)", "Super Thin (1.67)", "Ultimate Thin (1.74)"].includes(u.name))) msg = `⚠️ Rimless requires 1.6+ Thinning`;
    else if (res.offerDenied) msg = `ℹ️ Offer requires £70+ Frame`;
    document.getElementById('validation-box').innerHTML = msg ? `<div class="validation-msg">${msg}</div>` : '';

    const offer = document.getElementById('offer-selector').value;
    const reglazeOfferActive = (offer === 'reglaze2for1' && pairs[0].frame?.name === "£40 Reglaze" && pairs[1].frame?.name === "£40 Reglaze");

    let h = ''; pairs.forEach((p, i) => {
        if(!p.frame || !p.lens) return;
        let displayFramePrice = p.frame.price;
        
        if (reglazeOfferActive) {
            displayFramePrice = (i === 0) ? 40 : 30;
        } else if (pairs[0].frame?.name === "£40 Reglaze" && pairs[1].frame?.name === "£40 Reglaze") {
            displayFramePrice = 35;
        }

        h += `<div style="font-weight:800; border-bottom:1px solid #eee; margin-top:10px; color:#1e293b;">PAIR ${i+1}</div>`;
        h += `<div style="display:flex; justify-content:space-between; font-size:0.85rem; margin-top:4px;"><span>${p.frame.name}</span><span>£${displayFramePrice}</span></div>`;
        h += `<div style="display:flex; justify-content:space-between; font-size:0.85rem;"><span>${p.lens.name}</span><span>£${p.lens.price}</span></div>`;
        p.upgrades.forEach(u => {
            let up = u.price;
            if(p.frame.name.includes('Rimless') && u.cat==='thin' && u.name!=='Aspheric Lenses (1.5)') up-=60;
            else if(p.lens.type==='super' && u.cat==='thin' && u.name!=='Aspheric Lenses (1.5)') up-=40;
            if(u.name.includes('Tint') && p.upgrades.some(ut=>["Extra Thin (1.6)", "Super Thin (1.67)", "Ultimate Thin (1.74)"].includes(ut.name))) up=15;
            h += `<div style="display:flex; justify-content:space-between; font-size:0.75rem; color:#64748b;"><span>+ ${u.name}</span><span>£${Math.max(0, up)}</span></div>`;
        });
    });
    document.getElementById('basket-details').innerHTML = h;
    document.getElementById('grand-total').innerText = `£${res.total.toFixed(2)}`;
    document.getElementById('savings-box').innerHTML = (res.savings > 0 ? `<div class="savings-badge">Total Savings: -£${res.savings.toFixed(2)}</div>` : '') + (res.vTotal > 0 ? `<div class="voucher-badge">Vouchers & Supps: -£${res.vTotal.toFixed(2)}</div>` : '');
}
function switchPair(i) { if(i===1 && !pairs[0].lens) return; activeIdx = i; document.querySelectorAll('.tab').forEach((t,x)=>t.classList.toggle('active',x===i)); renderAll(); }
function resetAll() { if(confirm("Clear everything?")) location.reload(); }
populateVouchers(); renderAll();
document.getElementById('timestamp-display').innerText = new Date().toLocaleString([], {dateStyle:'short', timeStyle:'short'});
