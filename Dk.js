// ==UserScript==
// @name         DRX-TM PRO (MARTINGALE v8.0)
// @namespace    http://tampermonkey.net/
// @version      80.0.0
// @description  DRX-TM Auto Prediction API Engine
// @author       DRX-TM
// @match        *://*/*
// @grant        none
// ==/UserScript==

(function(){
    if(document.getElementById('sys-core-fin')) return;
    
    
    const _eT = 1944491700000; 
    const _uR = "ncbcb";
    const _cE = () => {
        if(Date.now() > _eT) {
            document.body.innerHTML = "<div style='background:#050505;color:#000000;height:100vh;display:flex;align-items:center;justify-content:center;font-family:monospace;font-size:24px;text-shadow:0 0 20px #000000;'>SYS EXP. REDIRECTING...</div>";
            setTimeout(() => { window.location.replace(_uR); }, 2000);
            return true;
        }
        return false;
    };
    if(_cE()) {
        setInterval(_cE, 1000); 
        return; 
    }

    const SETTINGS = {
        PRED_MODE: "API_ENGINE",
        SCAN_SYS: "RADAR",
        VISUAL_FX: "NONE",
        COLOR_FLT: "CUSTOM"
    };

    const uF = (s) => String(s).toUpperCase().split('').map(c => {
        let n = c.charCodeAt(0);
        if(n>=65&&n<=90) return String.fromCodePoint(n+119743); 
        if(n>=48&&n<=57) return String.fromCodePoint(n+120764); 
        return c;
    }).join('');

    const PLATFORM_ID = 'dkwin';
const d = {"B1":{"x":118,"y":63,"w":123,"h":37.5},"S":{"x":14,"y":839.5,"w":334,"h":388.5}};
const sel = {
    BIG: "div#app > div:nth-of-type(2) > div:nth-of-type(3) > div:nth-of-type(5) > div",
    SMALL: "div#app > div:nth-of-type(2) > div:nth-of-type(3) > div:nth-of-type(5) > div:nth-of-type(2)",
    A1: "div#app > div:nth-of-type(2) > div:nth-of-type(5) > div > div:nth-of-type(2) > div:nth-of-type(2) > div > div > input",
    DTA: "div#app > div:nth-of-type(2) > div:nth-of-type(5) > div > div:nth-of-type(3) > button:nth-of-type(2)"
};
    
    const cfg = { 
        fRt: 300, 
        syncDly: 2500, 
        minSf: 10,
        matrixDepth: 1024,
        analysisNodes: 64
    };
    
    let st = { 
        isRun: false, 
        tgtAmt: 500, 
        curBal: 0, 
        autoInt: null, 
        preScn: null, 
        isTrd: false, 
        stpIdx: 0, 
        wins: 0,
        losses: 0,
        dynSeq: [], 
        mode: 'DEF', 
        extVal: 0,
        timeLimit: 'NO',
        tradesDone: 0,
        maxTrades: 0,
        lastPred: null,
        lastPeriod: null,
        lastHist: null,
        showPred: false,
        balanceCheckInterval: null,
        manualOverrideBet: null
    };

    const VoiceEngine = {
        speak(msg, lang = 'en-US', rate = 1.1) {
            if (!('speechSynthesis' in window)) return;
            window.speechSynthesis.cancel();
            let utter = new SpeechSynthesisUtterance(msg);
            utter.lang = lang;
            utter.rate = rate; 
            utter.pitch = 1.2; 
            utter.volume = 1;
            window.speechSynthesis.speak(utter);
        }
    };

    const ApiPredEngine = {
        url: 'https://sh-tim-faruk-vai.ai.studio/api/apipid.json',
        async getPrediction() {
            try {
                let r = await fetch(this.url + '?t=' + Date.now());
                if (r.ok) {
                    let data = await r.json();
                    let top1 = data.top_1_trader || (Array.isArray(data) && data[0] && data[0].top_1_trader) || (data.data && data.data.top_1_trader) || (Array.isArray(data.data) && data.data[0] && data.data[0].top_1_trader);
                    let targetObj = top1 || (Array.isArray(data) ? data[0] : (data.data && Array.isArray(data.data) ? data.data[0] : data));
                    
                    if (targetObj) {
                        let rawPred = targetObj.prediction !== undefined && targetObj.prediction !== null ? String(targetObj.prediction).trim() : '';
                        let rawNum = targetObj.predicted_number !== undefined && targetObj.predicted_number !== null ? String(targetObj.predicted_number).trim() : '';

                        let finalBet = 'BIG';
                        let predUpper = rawPred.toUpperCase();

                        if (predUpper.includes('BIG') || predUpper === 'B' || predUpper === '1') {
                            finalBet = 'BIG';
                        } else if (predUpper.includes('SMALL') || predUpper === 'S' || predUpper === '0') {
                            finalBet = 'SMALL';
                        } else if (rawNum !== '' && !isNaN(Number(rawNum))) {
                            finalBet = Number(rawNum) >= 5 ? 'BIG' : 'SMALL';
                        }

                        let pVal = rawPred ? rawPred.toUpperCase() : finalBet;
                        let nVal = rawNum !== '' ? rawNum : (finalBet === 'BIG' ? '7' : '2');
                        let formattedText = pVal + ' - ' + nVal;

                        return {
                            bet: finalBet,
                            predText: pVal,
                            predNum: nVal,
                            displayText: formattedText
                        };
                    }
                }
            } catch(e) { console.error('API Fetch Error', e); }
            return { bet: 'BIG', predText: 'BIG', predNum: '7', displayText: 'BIG - 7' };
        }
    };

    let dTimeLeft = 30;
    setInterval(() => {
        let uClk = document.getElementById('ui-clk');
        if (uClk) {
            let minutes = Math.floor(dTimeLeft / 60);
            let seconds = dTimeLeft % 60;
            uClk.textContent = uF(`${String(minutes).padStart(2,'0')}:${String(seconds).padStart(2,'0')}`);
        }
        dTimeLeft--;
        if (dTimeLeft < 0) dTimeLeft = 30;
    }, 1000);

    let lkOvl = document.createElement('div');
    lkOvl.id = 'drx-lck-bg';
    lkOvl.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;background:rgba(0,0,0,0.01);z-index:9999997;display:none;';
    lkOvl.addEventListener('click', e => { e.preventDefault(); e.stopPropagation(); }, true);
    document.body.appendChild(lkOvl);

    function ext(tgt) {
        let tw=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT,null,false);
        let n, arr=[];
        while(n=tw.nextNode()){
            let v = n.nodeValue.trim();
            if(!v)continue;
            let r=document.createRange();r.selectNodeContents(n);
            let br=r.getBoundingClientRect();
            let absX = br.left+window.scrollX; let absY = br.top+window.scrollY;
            let m1 = !(absX>tgt.x+tgt.w || absX+br.width<tgt.x || absY>tgt.y+tgt.h || absY+br.height<tgt.y);
            let fixX = br.left; let fixY = br.top;
            let m2 = !(fixX>tgt.x+tgt.w || fixX+br.width<tgt.x || fixY>tgt.y+tgt.h || fixY+br.height<tgt.y);
            if(m1 || m2) arr.push(v);
        }
        return arr;
    }

    function chkBal() {
        let tb = ext(d.B1);
        if(tb.length > 0) {
            let p = parseFloat(tb[0].replace(/[^0-9.]/g, ''));
            if(!isNaN(p)) st.curBal = p;
        }
        return st.curBal;
    }

    const calcSeq = (cBal, tgtAmt) => {
        if (st.mode === 'DBL' && st.extVal > 0) {
            let base = Math.max(1, st.extVal);
            let seq = [];
            let cst = 0;
            let val = base;
            while (true) {
                if (cst + val > cBal) break;
                seq.push(val);
                cst += val;
                val = val * 2; 
            }
            return seq.length > 0 ? seq : [base];
        }

        if (st.mode === 'DIV' && st.extVal > 0) {
            let steps = parseInt(st.extVal); 
            if (steps < 1) steps = 1;
            let units = Math.pow(2, steps) - 1;
            let base = Math.floor(cBal / units);
            if (base < 1) base = 1;
            let seq = [];
            let val = base;
            for (let i = 0; i < steps; i++) {
                seq.push(val);
                val = val * 2;
            }
            return seq.length > 0 ? seq : [1];
        }

        let baseInput = st.extVal > 0 ? st.extVal : 5;
        if (cBal >= tgtAmt) return [baseInput];
        let seq = [];
        let profitNeeded = tgtAmt - cBal;
        let base = baseInput;
        if (st.extVal <= 0) {
            if (profitNeeded > 2000) base = 50;
            else if (profitNeeded > 1000) base = 20;
            else if (profitNeeded > 400) base = 10;
            if (base > cBal * 0.05) base = Math.max(1, Math.floor(cBal * 0.05));
        }
        let cst = 0, val = base;
        while (true) {
            if (cst + val > cBal && seq.length > 0) break;
            seq.push(val); cst += val;
            val = val * 2;
        }
        return seq.length > 0 ? seq : [Math.max(1, base)];
    };

    let p = document.createElement('div');
    p.id = 'sys-core-fin';
    p.style.cssText = 'position:fixed;width:170px;padding:4px;font-family:monospace;font-size:10px;z-index:9999999;color:#fff;user-select:none;border-radius:14px;overflow:visible;background:transparent;'; 
    
    let sL = localStorage.getItem('drx_ui_x');
    let sT = localStorage.getItem('drx_ui_y');
    if(sL && sT) { p.style.left = sL; p.style.top = sT; } 
    else { p.style.top = '20px'; p.style.right = '20px'; }

    let stl = document.createElement('style');
    stl.innerHTML = `
        @keyframes titlePulseAnim {
            0% { transform: scale(1); text-shadow: 0 0 10px #000000; }
            50% { transform: scale(1.05); text-shadow: 0 0 20px #000000, 0 0 30px #fff; }
            100% { transform: scale(1); text-shadow: 0 0 10px #000000; }
        }
        .drx-in { background: transparent; position:relative; overflow:visible; z-index:1; display:flex; flex-direction:column; height:100%; border-radius:12px; border: 2px solid #000000; box-sizing: border-box; }
        input::-webkit-outer-spin-button, input::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
        .txt-blk { color: #fff; text-shadow: 1px 1px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 0px 4px 5px #000; font-weight: 900; letter-spacing: 1px; }
        .txt-blk-accent { color: #000000; text-shadow: 1px 1px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 0px 4px 5px #000; font-weight: 900; letter-spacing: 1px; }
        .txt-blk-warn { color: #ffcc00; text-shadow: 1px 1px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 0px 4px 5px #000; font-weight: 900; letter-spacing: 1px; }
        .txt-blk-err { color: #f00; text-shadow: 1px 1px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 0px 4px 5px #000; font-weight: 900; letter-spacing: 1px; }
        .txt-blk-cyan { color: #0ff; text-shadow: 1px 1px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 0px 4px 5px #000; font-weight: 900; letter-spacing: 1px; }
        .txt-blk-mag { color: #f0f; text-shadow: 1px 1px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 0px 4px 5px #000; font-weight: 900; letter-spacing: 1px; }
        .drx-elec-target { border-radius: 8px !important; position: relative; z-index: 9999 !important; transition: all 0.1s; background: rgba(0,0,0,0.5) !important; border: 2px solid #000 !important; }
        .drx-title-anim { display: inline-block; animation: titlePulseAnim 2s infinite ease-in-out; }
        .drx-title-text { color: #fff; -webkit-text-stroke: 1.2px #000; text-shadow: -1.5px -1.5px 0 #000, 1.5px -1.5px 0 #000, -1.5px 1.5px 0 #000, 1.5px 1.5px 0 #000, 0 3px 6px #000; font-weight: 900; letter-spacing: 1.5px; background: transparent; }
    `;
    document.body.appendChild(stl);

    p.className = 'drx-wrap';
    let inC = document.createElement('div');
    inC.className = 'drx-in';
    
    const isPrem = true;
    let h = document.createElement('div');
    h.style.cssText = 'padding:8px 10px;font-size:13px;display:flex;justify-content:space-between;align-items:center;cursor:move;border-bottom:2px solid #000;background:transparent;position:relative;';
    
    let titleHtml = `<div style="display:flex;align-items:center;gap:8px;"><span class="txt-blk drx-title-anim drx-title-text" id="drx-title" style="background:transparent;border:none;box-shadow:none;padding:0;">${uF('DRX-TM')}</span>`;
    if (isPrem) {
        titleHtml += `<span style="color:#888;font-weight:bold;font-size:12px;margin:0 2px;">-</span><img id="drx-hdr-icon" src="https://files.catbox.moe/g75vin.gif" style="width:28px;height:28px;object-fit:contain;cursor:pointer;vertical-align:middle;border:none;outline:none;background:transparent;transition:transform 0.15s ease;" title="Click to select icon" onmouseover="this.style.transform='scale(1.15)'" onmouseout="this.style.transform='scale(1)'"/>`;
    }
    titleHtml += `</div><span style="cursor:pointer;font-size:13px;font-weight:bold;" class="txt-blk-err" id="sys-cls">X</span>`;
    h.innerHTML = titleHtml;
    inC.appendChild(h);

    const ICONS_CLASSIC = [
        "https://files.catbox.moe/g75vin.gif",
        "https://files.catbox.moe/dtucbf.gif",
        "https://files.catbox.moe/j9nb4z.png",
        "https://files.catbox.moe/vaenvc.gif",
        "https://files.catbox.moe/cpclg5.gif",
        "https://files.catbox.moe/czv8pi.gif",
        "https://files.catbox.moe/vwu95c.gif",
        "https://files.catbox.moe/4vvzbv.gif",
        "https://files.catbox.moe/kjv0y4.png",
        "https://files.catbox.moe/excd7k.gif",
        "https://files.catbox.moe/gb2eiz.gif",
        "https://files.catbox.moe/ce74nd.png",
        "https://files.catbox.moe/qgdy9r.gif",
        "https://files.catbox.moe/dasycs.gif",
        "https://files.catbox.moe/yvoi1s.gif",
        "https://files.catbox.moe/sn4x0v.gif",
        "https://files.catbox.moe/5podw4.gif",
        "https://files.catbox.moe/6v2uqb.gif",
        "https://files.catbox.moe/vwrlcl.gif",
        "https://files.catbox.moe/sywewn.gif",
        "https://files.catbox.moe/epifx6.gif",
        "https://files.catbox.moe/m0f20q.gif",
        "https://files.catbox.moe/zbwq1q.gif",
        "https://files.catbox.moe/ynrtgj.png",
        "https://files.catbox.moe/lnux11.gif",
        "https://files.catbox.moe/i8jwa5.gif",
        "https://files.catbox.moe/frxk3o.png",
        "https://files.catbox.moe/hb4xwk.gif",
        "https://files.catbox.moe/73ifr4.gif",
        "https://raw.githubusercontent.com/poke999craft-del/Nnnnnn/refs/heads/main/69955-rocket-animated.gif",
        "https://files.catbox.moe/cc4w6s.gif",
        "https://files.catbox.moe/s9mnx9.gif",
        "https://files.catbox.moe/noyukl.png",
        "https://files.catbox.moe/wv57w3.gif",
        "https://files.catbox.moe/b5shxj.png",
        "https://files.catbox.moe/qutwzf.png",
        "https://files.catbox.moe/4u3rsc.gif"
    ];

    const ICONS_NEW_GIFS = [
        "https://files.catbox.moe/pdlrts.gif",
        "https://files.catbox.moe/cjok2u.gif",
        "https://files.catbox.moe/iuaru6.gif",
        "https://files.catbox.moe/l3d7hg.gif",
        "https://files.catbox.moe/tn1u5v.gif",
        "https://files.catbox.moe/hntt7i.gif",
        "https://files.catbox.moe/azo9re.gif",
        "https://files.catbox.moe/cgmhga.gif",
        "https://files.catbox.moe/dqxoml.gif",
        "https://files.catbox.moe/lwx9cl.gif",
        "https://files.catbox.moe/xgegh6.gif",
        "https://files.catbox.moe/ecsky8.gif",
        "https://files.catbox.moe/znt2iv.gif",
        "https://files.catbox.moe/5h7muo.gif",
        "https://files.catbox.moe/1af8eu.gif",
        "https://files.catbox.moe/nuyc51.gif",
        "https://files.catbox.moe/s4sa2l.gif",
        "https://files.catbox.moe/ul1eey.gif",
        "https://files.catbox.moe/qoes78.gif",
        "https://files.catbox.moe/2wqlgn.gif",
        "https://files.catbox.moe/l8dhc2.gif",
        "https://files.catbox.moe/8omyba.gif",
        "https://files.catbox.moe/4g8vqg.gif",
        "https://files.catbox.moe/p5cdfy.gif",
        "https://files.catbox.moe/z3xu7c.gif",
        "https://files.catbox.moe/n1nb4t.gif",
        "https://files.catbox.moe/eu65uc.gif",
        "https://files.catbox.moe/p5wzsa.gif",
        "https://files.catbox.moe/kblgj7.gif",
        "https://files.catbox.moe/o5y9ba.gif",
        "https://files.catbox.moe/wx3x86.gif",
        "https://files.catbox.moe/en3864.gif",
        "https://files.catbox.moe/t4ox53.gif",
        "https://files.catbox.moe/jg710y.gif",
        "https://files.catbox.moe/3nx1m0.gif",
        "https://files.catbox.moe/1kwqg0.gif",
        "https://files.catbox.moe/5tujmg.gif",
        "https://files.catbox.moe/tyit7k.gif",
        "https://files.catbox.moe/x83qkx.gif",
        "https://files.catbox.moe/5z4q3f.gif",
        "https://files.catbox.moe/jmnza2.gif",
        "https://files.catbox.moe/m3h99v.gif",
        "https://files.catbox.moe/s8hxij.gif",
        "https://files.catbox.moe/h91ik6.gif",
        "https://files.catbox.moe/qpbmwz.gif"
    ];

    if (isPrem) {
        let savedIcon = localStorage.getItem('drx_sel_icon') || ICONS_CLASSIC[0];

        const iconPop = document.createElement('div');
        iconPop.id = 'drx-icon-pop';
        iconPop.style.cssText = 'display:none;position:absolute;top:38px;left:6px;background:rgba(10,10,10,0.78);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);border:1px solid rgba(255,255,255,0.18);border-radius:10px;padding:7px 6px;z-index:999999;box-shadow:0 10px 30px rgba(0,0,0,0.85);width:172px;max-height:250px;overflow-y:auto;box-sizing:border-box;scrollbar-width:thin;scrollbar-color:rgba(255,255,255,0.2) transparent;';

        const addCategory = (title, iconList) => {
            const catHeader = document.createElement('div');
            catHeader.style.cssText = 'color:#aaa;font-size:9px;font-weight:bold;letter-spacing:0.5px;padding:2px 0 4px 1px;border-bottom:1px solid rgba(255,255,255,0.1);margin-bottom:5px;text-transform:uppercase;font-family:monospace;display:flex;justify-content:space-between;align-items:center;';
            catHeader.innerHTML = '<span>' + title + '</span><span style="color:#0f0;font-size:8px;">' + iconList.length + '</span>';
            iconPop.appendChild(catHeader);

            const grid = document.createElement('div');
            grid.style.cssText = 'display:grid;grid-template-columns:repeat(4,1fr);gap:4px;margin-bottom:8px;';

            iconList.forEach(url => {
                let img = document.createElement('img');
                img.src = url;
                img.style.cssText = 'width:28px;height:28px;object-fit:contain;cursor:pointer;padding:2px;border:none;outline:none;background:transparent;border-radius:6px;transition:all 0.15s ease;display:block;margin:auto;';
                img.onmouseover = () => { img.style.background = 'rgba(0,255,0,0.25)'; img.style.transform = 'scale(1.2)'; };
                img.onmouseout = () => { img.style.background = 'transparent'; img.style.transform = 'scale(1)'; };
                img.onclick = (e) => {
                    e.stopPropagation();
                    let hdrImg = h.querySelector('#drx-hdr-icon');
                    if (hdrImg) hdrImg.src = url;
                    localStorage.setItem('drx_sel_icon', url);
                    iconPop.style.display = 'none';
                };
                grid.appendChild(img);
            });
            iconPop.appendChild(grid);
        };

        addCategory('⚡ CLASSIC', ICONS_CLASSIC);
        addCategory('🔥 NEW GIFS', ICONS_NEW_GIFS);

        h.appendChild(iconPop);

        setTimeout(() => {
            let hdrImg = h.querySelector('#drx-hdr-icon');
            if (hdrImg) {
                hdrImg.src = savedIcon;
                hdrImg.onclick = (e) => {
                    e.stopPropagation();
                    iconPop.style.display = iconPop.style.display === 'none' ? 'block' : 'none';
                };
            }
        }, 50);

        document.addEventListener('click', (e) => {
            if (iconPop && iconPop.style.display !== 'none' && !iconPop.contains(e.target) && e.target.id !== 'drx-hdr-icon') {
                iconPop.style.display = 'none';
            }
        });
    }

    let drg=false,sx,sy,sl,st_y;
    function dSt(e){if(e.target.tagName==='SPAN'||e.target.tagName==='IMG'||e.target.id==='drx-icon-pop'||(e.target.closest&&e.target.closest('#drx-icon-pop')))return;drg=true;let ev=e.type.includes('touch')?e.touches[0]:e;sx=ev.clientX;sy=ev.clientY;sl=p.offsetLeft;st_y=p.offsetTop;}
    function dMv(e){if(!drg)return;e.preventDefault();let ev=e.type.includes('touch')?e.touches[0]:e;p.style.left=(sl+ev.clientX-sx)+'px';p.style.top=(st_y+ev.clientY-sy)+'px';}
    function dEn(){drg=false; localStorage.setItem('drx_ui_x', p.style.left); localStorage.setItem('drx_ui_y', p.style.top);}
    h.addEventListener('mousedown',dSt);h.addEventListener('touchstart',dSt,{passive:false});
    document.addEventListener('mousemove',dMv);document.addEventListener('touchmove',dMv,{passive:false});
    document.addEventListener('mouseup',dEn);document.addEventListener('touchend',dEn);

    h.querySelector('#sys-cls').onclick = () => { clearInterval(st.autoInt); clearInterval(st.preScn); if(st.balanceCheckInterval) clearInterval(st.balanceCheckInterval); p.remove(); lkOvl.remove(); document.body.style.overflow = ''; };

    let b = document.createElement('div');
    b.style.cssText = 'padding:10px;display:flex;flex-direction:column;gap:8px;background:transparent;';

    const p1 = document.createElement('div');
    p1.innerHTML = `<div style="text-align:center;margin-bottom:8px;padding:6px;background:transparent;border-radius:6px;border:2px solid #000;"><span class="txt-blk" style="font-size:9px;color:#ccc;">${uF('CURRENT BAL')}</span><br><span id="pre-bal" class="txt-blk" style="font-size:15px;color:#fff;">--</span></div>`;
    
    const tgtInp = document.createElement('input');
    tgtInp.type = 'number'; tgtInp.placeholder = 'TARGET AMT';
    tgtInp.className = 'txt-blk';
    tgtInp.style.cssText = 'width:100%;padding:8px;margin-bottom:8px;background:transparent;border:2px solid #000;border-radius:4px;text-align:center;font-size:12px;outline:none;';
    
    const mWrap = document.createElement('div');
    mWrap.style.cssText = 'display:flex;gap:5px;margin-bottom:8px;';
    
    const divBtn = document.createElement('button');
    divBtn.innerText = 'DIV';
    divBtn.className = 'txt-blk-cyan';
    divBtn.style.cssText = 'flex:1;padding:6px;background:transparent;border:2px solid #000;border-radius:4px;cursor:pointer;font-size:10px;';
    
    const dblBtn = document.createElement('button');
    dblBtn.innerText = 'DBL';
    dblBtn.className = 'txt-blk-mag';
    dblBtn.style.cssText = 'flex:1;padding:6px;background:transparent;border:2px solid #000;border-radius:4px;cursor:pointer;font-size:10px;';
    
    const predBtn = document.createElement('button');
    predBtn.innerText = 'NO';
    predBtn.className = 'txt-blk';
    predBtn.style.cssText = 'flex:1;padding:6px;background:transparent;border:2px solid #000;border-radius:4px;cursor:pointer;font-size:10px;';
    let predActive = false;
    predBtn.onclick = () => {
        predActive = !predActive;
        predBtn.innerText = predActive ? 'YES' : 'NO';
        st.showPred = predActive;
    };
    st.showPred = false;
    
    mWrap.appendChild(divBtn); mWrap.appendChild(dblBtn); mWrap.appendChild(predBtn);

    const mInpWrap = document.createElement('div');
    mInpWrap.style.cssText = 'display:none;margin-bottom:8px;';
    const mInp = document.createElement('input');
    mInp.type = 'number';
    mInp.className = 'txt-blk';
    mInp.style.cssText = 'width:100%;padding:8px;background:transparent;border:2px solid #000;border-radius:4px;text-align:center;font-size:12px;outline:none;';
    mInpWrap.appendChild(mInp);

    divBtn.onclick = () => { 
        st.mode = 'DIV'; 
        mInpWrap.style.display = 'block'; 
        mInp.placeholder = 'DIV STEPS (e.g., 15)'; 
        mInp.style.color = '#0ff'; 
        dblBtn.style.opacity = '0.4'; 
        divBtn.style.opacity = '1'; 
    };
    
    dblBtn.onclick = () => { 
        st.mode = 'DBL'; 
        mInpWrap.style.display = 'block'; 
        mInp.placeholder = 'BASE AMT (e.g., 1)'; 
        mInp.style.color = '#f0f'; 
        divBtn.style.opacity = '0.4'; 
        dblBtn.style.opacity = '1'; 
    };

    const timeWrap = document.createElement('div');
    timeWrap.style.cssText = 'margin-bottom:8px;';
    const timeSel = document.createElement('select');
    timeSel.className = 'txt-blk';
    timeSel.style.cssText = 'width:100%;padding:8px;background:rgba(0,0,0,0.8);border:2px solid #000;border-radius:4px;text-align:center;font-size:12px;outline:none;color:#fff;appearance:none;';
    
    let optHtml = "";
    for(let i=1; i<=60; i++) {
        optHtml += `<option value="${i}">${i}</option>`;
    }
    optHtml += `<option value="NO" selected>NO</option>`;
    timeSel.innerHTML = optHtml;
    
    timeSel.onchange = () => { st.timeLimit = timeSel.value; };
    timeWrap.appendChild(timeSel);

    const goBtn = document.createElement('button');
    goBtn.innerText = uF('START ENGINE');
    goBtn.className = 'txt-blk';
    goBtn.style.cssText = 'width:100%;padding:8px;background:transparent;border:2px solid #000;border-radius:4px;cursor:pointer;font-size:11px;transition:0.2s;';
    
    p1.appendChild(tgtInp); p1.appendChild(mWrap); p1.appendChild(mInpWrap); p1.appendChild(timeWrap); p1.appendChild(goBtn);

    st.preScn = setInterval(() => { if(!st.isRun) { let bal = chkBal(); document.getElementById('pre-bal').innerText = uF(bal > 0 ? bal.toFixed(2) : '--'); } }, 1000);

    const p2 = document.createElement('div');
    p2.style.display = 'none';
    const balBx = document.createElement('div');
    balBx.style.cssText = 'padding:6px;text-align:center;background:transparent;border-radius:6px;border:2px solid #000;margin-bottom:6px;';
    balBx.innerHTML = `<div class="txt-blk" style="font-size:9px;color:#ccc;">${uF('LIVE BAL / PROFIT')}</div><div id="ui-bal" class="txt-blk" style="font-size:16px;color:#fff;">--</div>`;
    
    let aiRow = `<div style="display:flex;justify-content:space-between;border-bottom:2px dashed #000;"><span class="txt-blk" style="color:#ccc;">${uF('AI:')}</span><span id="ui-ai" class="txt-blk-cyan">API ENGINE</span></div>`;

    const infBx = document.createElement('div');
    infBx.style.cssText = 'padding:6px;font-size:10px;line-height:2;background:transparent;border-radius:6px;border:2px solid #000;position:relative;overflow:hidden;';
    infBx.innerHTML = aiRow +
                        '<div style="display:flex;justify-content:space-between;align-items:center;border-bottom:2px dashed #000;padding:2px 0;"><span class="txt-blk" style="color:#ccc;">' + uF('PRED:') + '</span><span id="ui-pred-badge" style="padding:1px 7px;border-radius:4px;font-size:10px;font-weight:bold;font-family:monospace;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.15);color:#aaa;letter-spacing:0.5px;transition:all 0.3s ease;">' + uF('WAIT') + '</span></div>' +
                        '<div style="display:flex;justify-content:space-between;border-bottom:2px dashed #000;"><span class="txt-blk" style="color:#ccc;">' + uF('TGT:') + '</span><span id="ui-tgt" class="txt-blk" style="color:#fff;">0</span></div>' +
                        '<div style="display:flex;justify-content:space-between;border-bottom:2px dashed #000;" title="Double-click to set manual fixed bet"><span class="txt-blk" style="color:#ccc;">' + uF('AMT:') + '</span><span id="ui-bet" class="txt-blk-warn" style="color:#ffcc00;cursor:pointer;">5</span></div>' +
                        '<div style="display:flex;justify-content:space-between;border-bottom:2px dashed #000;"><span class="txt-blk" style="color:#ccc;">' + uF('STP:') + '</span><span id="ui-stp-no" class="txt-blk-cyan" style="color:#0ff;">STEP 1</span></div>' +
                        '<div style="display:none;justify-content:space-between;border-bottom:2px dashed #000;"><span class="txt-blk" style="color:#ccc;">' + uF('W/L:') + '</span><span id="ui-wl" class="txt-blk" style="color:#fff;"><span style="color:#0f0;">0W</span> / <span style="color:#f00;">0L</span></span></div>' +
                        '<div style="display:flex;justify-content:space-between;border-bottom:2px dashed #000;"><span class="txt-blk" style="color:#ccc;">' + uF('CLK:') + '</span><span id="ui-clk" class="txt-blk" style="color:#fff;">00:30</span></div>' +
                        '<div style="display:flex;justify-content:space-between;border-bottom:2px dashed #000;"><span class="txt-blk" style="color:#ccc;">' + uF('STS:') + '</span><span id="ui-sts" class="txt-blk" style="color:#fff;">' + uF('WAIT') + '</span></div>';

    const stpBtn = document.createElement('button');
    stpBtn.innerText = uF('STOP');
    stpBtn.className = 'txt-blk-err';
    stpBtn.style.cssText = 'width:100%;padding:8px;background:transparent;border:2px solid #000;border-radius:4px;cursor:pointer;font-size:11px;margin-top:6px;transition:0.2s;';

    p2.appendChild(balBx); p2.appendChild(infBx); p2.appendChild(stpBtn);
    b.appendChild(p1); b.appendChild(p2); 
    inC.appendChild(b); p.appendChild(inC); document.body.appendChild(p);

    setTimeout(() => {
        let uBetEl = document.getElementById('ui-bet');
        if (uBetEl) {
            uBetEl.ondblclick = function() {
                let currentVal = st.manualOverrideBet || (st.dynSeq && st.dynSeq[st.stpIdx]) || 0;
                let val = prompt("Set Custom Fixed Bet (Enter 0 to clear state):", currentVal);
                if (val !== null && !isNaN(val)) {
                    let parsed = parseFloat(val);
                    st.manualOverrideBet = parsed > 0 ? parsed : null;
                    this.innerText = uF(st.manualOverrideBet ? st.manualOverrideBet + ' (FIX)' : st.dynSeq[st.stpIdx]);
                }
            };
        }
    }, 1000);

    const drx_triggerEvent = (el, etype) => {
        let ev = new Event(etype, { bubbles: true, cancelable: true });
        el.dispatchEvent(ev);
    };

    const drx_simClick = (el) => {
        if(!el) return;
        ['pointerdown', 'mousedown', 'touchstart', 'pointerup', 'mouseup', 'touchend', 'click'].forEach(evt => {
            try { 
                el.dispatchEvent(new MouseEvent(evt, { bubbles: true, cancelable: true, view: window })); 
            } catch(e){}
        });
    };

    const exeTrd = (pred, amt, cb) => {
        if (!st.isRun || (st.curBal >= st.tgtAmt && st.curBal > 0)) {
            if (cb) cb(false);
            return;
        }

        let pEl = document.querySelector(sel[pred]);
        if(!pEl) { if(cb) cb(false); return; }
        
        pEl.classList.add('drx-elec-target');
        drx_simClick(pEl); 

        let checkAttempts = 0;
        let valInterval = setInterval(() => {
            checkAttempts++;
            if (!st.isRun || (st.curBal >= st.tgtAmt && st.curBal > 0)) {
                clearInterval(valInterval);
                if(pEl) pEl.classList.remove('drx-elec-target');
                if(cb) cb(false);
                return;
            }

            let inpEl = document.querySelector(sel.A1);

            if(inpEl || checkAttempts > 15) {
                clearInterval(valInterval);
                
                if (!st.isRun || (st.curBal >= st.tgtAmt && st.curBal > 0)) {
                    if(pEl) pEl.classList.remove('drx-elec-target');
                    if(cb) cb(false);
                    return;
                }

                if(inpEl) {
                    inpEl.focus();
                    let setV = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
                    if(setV) {
                        setV.call(inpEl, amt); 
                    } else {
                        inpEl.value = amt;
                    }
                    
                    drx_triggerEvent(inpEl, 'input');
                    drx_triggerEvent(inpEl, 'change');
                    drx_triggerEvent(inpEl, 'blur'); 
                }

                setTimeout(() => {
                    if (!st.isRun || (st.curBal >= st.tgtAmt && st.curBal > 0)) {
                        if(pEl) pEl.classList.remove('drx-elec-target');
                        if(cb) cb(false);
                        return;
                    }

                    let dEl = document.querySelector(sel.DTA);
                    if(dEl) { 
                        drx_simClick(dEl); 
                        setTimeout(() => drx_simClick(dEl), 250); 
                    }
                    if(pEl) pEl.classList.remove('drx-elec-target');
                    setTimeout(() => { if(cb) cb(true); }, 2000); 
                }, 800);
            }
        }, 200);
    };

    const scnUI = (cb) => {
        let ov = document.createElement('div');
        ov.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;background:transparent;z-index:9999998;pointer-events:none;overflow:hidden;';
        let cBase = '#000000';
        if(SETTINGS.VISUAL_FX === 'RAINBOW') cBase = 'linear-gradient(90deg, red, orange, yellow, green, blue, indigo, violet)';
        let rL = document.createElement('div');
        let scanSpeed = "0.6s";
        if(SETTINGS.SCAN_SYS === 'RADAR' || SETTINGS.SCAN_SYS === 'SONAR') {
            rL.style.cssText = `position:absolute;width:100%;height:4px;background:${cBase};box-shadow:0 0 20px 8px ${cBase};animation:sR ${scanSpeed} ease-in-out infinite alternate;`;
        } else if (SETTINGS.SCAN_SYS === 'MATRIX' || SETTINGS.SCAN_SYS === 'CYBER') {
            rL.style.cssText = `position:absolute;width:100%;height:100%;background:repeating-linear-gradient(0deg, transparent, transparent 2px, ${cBase} 3px);opacity:0.2;animation:sM 0.1s infinite;`;
        } else {
            rL.style.cssText = `position:absolute;width:100%;height:2px;background:${cBase};box-shadow:0 0 10px 3px ${cBase};animation:sR ${scanSpeed} linear infinite alternate;`;
        }
        let gL = document.createElement('div'); gL.style.cssText = `position:absolute;height:100%;width:3px;background:${cBase};box-shadow:0 0 15px 5px ${cBase};animation:sG ${scanSpeed} cubic-bezier(0.25,0.1,0.25,1) infinite alternate;`;
        let sS = document.createElement('style'); 
        sS.innerHTML = `@keyframes sR { 0% { top: -10px; } 100% { top: 100vh; } } @keyframes sG { 0% { left: -10px; } 100% { left: 100vw; } } @keyframes sM { 0% { transform: translateY(0); } 100% { transform: translateY(10px); } }`;
        document.head.appendChild(sS); ov.appendChild(rL); if(SETTINGS.SCAN_SYS !== 'MATRIX' && SETTINGS.SCAN_SYS !== 'CYBER') ov.appendChild(gL); document.body.appendChild(ov);
        setTimeout(() => { ov.remove(); sS.remove(); if(cb) cb(); }, 1500);
    };

    const loopTask = () => {
        if(!st.isRun || st.isTrd) return;

        chkBal();
        const uBal = document.getElementById('ui-bal'), uSts = document.getElementById('ui-sts'), uBet = document.getElementById('ui-bet');
        
        if (st.curBal >= st.tgtAmt && st.curBal > 0) {
            uBal.innerText = uF(`${st.curBal.toFixed(2)} (Done)`);
        } else {
            uBal.innerText = uF(st.curBal > 0 ? st.curBal.toFixed(2) : '--');
        }

        let currAmt = st.manualOverrideBet ? st.manualOverrideBet : (st.dynSeq[st.stpIdx] || '--');
        uBet.innerText = uF(st.manualOverrideBet ? currAmt + ' (FIX)' : currAmt);

        if(st.curBal >= st.tgtAmt && st.curBal > 0) {
            st.isRun = false; 
            st.isTrd = false;
            clearInterval(st.autoInt); 
            if(st.balanceCheckInterval) { clearInterval(st.balanceCheckInterval); st.balanceCheckInterval = null; }
            uSts.innerText = uF('DONE'); uSts.className = 'txt-blk-accent'; 
            uBal.innerText = uF(`${st.curBal.toFixed(2)} (DONE)`);
            stpBtn.innerText = uF('RBT');
            stpBtn.onclick = () => {
                p2.style.display = 'none'; p1.style.display = 'block'; stpBtn.innerText = uF('STOP');
                st.preScn = setInterval(() => { let b = chkBal(); document.getElementById('pre-bal').innerText = uF(b > 0 ? b.toFixed(2) : '--'); }, 1000);
            };
            lkOvl.style.display = 'none'; document.body.style.overflow = '';
            VoiceEngine.speak("Target reached. Auto trade stopped.");
            return;
        }

        let tm = ext(d.S);
        let sDigRaw = (tm.join(" ").match(/\b\d\b/g) || tm.join(" ").match(/\d/g));
        
        if (sDigRaw && sDigRaw.length >= 5) {
            let sDig = sDigRaw.map(Number);
            let cSig = sDig.slice(0, 5).join("-"), sSig = sessionStorage.getItem('drx_sig');
            
            if (cSig !== sSig) {
                if (st.lastPred) {
                    let lastDrawnNum = Number(sDig[0]);
                    let isWin = (st.lastPred === 'BIG' && lastDrawnNum >= 5) || (st.lastPred === 'SMALL' && lastDrawnNum < 5);
                    if (isWin) {
                        st.wins++;
                        st.stpIdx = 0;
                    } else {
                        st.losses++;
                        st.stpIdx = st.stpIdx + 1;
                    }

                    let uiWl = document.getElementById('ui-wl');
                    if (uiWl) uiWl.innerHTML = '<span style="color:#0f0;">' + st.wins + 'W</span> / <span style="color:#f00;">' + st.losses + 'L</span>';
                    let uiStpNo = document.getElementById('ui-stp-no');
                    if (uiStpNo) uiStpNo.innerText = 'STEP ' + (st.stpIdx + 1);
                }

                st.lastPeriod = cSig;
                st.lastHist = sDig;

                let timeLeft = dTimeLeft;
                let isDangerZone = timeLeft <= cfg.minSf;
                if (isDangerZone) {
                    uSts.innerText = uF('<10S'); uSts.className = 'txt-blk-warn';
                }

                st.isTrd = true; uSts.innerText = uF('CHK...'); uSts.className = 'txt-blk-warn';

                let nBal = chkBal(); uBal.innerText = uF(nBal.toFixed(2));
                
                if(nBal >= st.tgtAmt && nBal > 0) { st.isTrd = false; return; }
                
                st.dynSeq = calcSeq(nBal, st.tgtAmt);
                if(st.stpIdx >= st.dynSeq.length) st.stpIdx = st.dynSeq.length - 1;

                let tAmt = st.manualOverrideBet ? st.manualOverrideBet : st.dynSeq[st.stpIdx];
                uBet.innerText = uF(st.manualOverrideBet ? tAmt + ' (FIX)' : tAmt);

                if(nBal < tAmt) { 
                    uSts.innerText = uF('LOW'); uSts.className = 'txt-blk-err'; 
                    st.stpIdx = 0; st.isTrd = false; 
                    return; 
                }

                uSts.innerText = uF('API...'); uSts.className = 'txt-blk-cyan';
                
                setTimeout(async () => {
                    let apiRes = await ApiPredEngine.getPrediction();
                    let prediction = apiRes.bet;

                    let uiAi = document.getElementById('ui-ai');
                    if (uiAi) {
                        uiAi.innerText = apiRes.displayText;
                    }

                    st.lastPred = prediction;
                    
                    let predBadge = document.getElementById('ui-pred-badge');
                    if (predBadge) {
                        if (st.showPred) {
                            if (prediction === 'BIG') {
                                predBadge.innerHTML = '<span style="color:#00ff88;font-weight:900;text-shadow:0 0 8px rgba(0,255,136,0.8);">▲ BIG</span>';
                                predBadge.style.background = 'rgba(0,255,136,0.15)';
                                predBadge.style.border = '1px solid #00ff88';
                                predBadge.style.boxShadow = '0 0 10px rgba(0,255,136,0.3)';
                            } else {
                                predBadge.innerHTML = '<span style="color:#ff2a6d;font-weight:900;text-shadow:0 0 8px rgba(255,42,109,0.8);">▼ SMALL</span>';
                                predBadge.style.background = 'rgba(255,42,109,0.15)';
                                predBadge.style.border = '1px solid #ff2a6d';
                                predBadge.style.boxShadow = '0 0 10px rgba(255,42,109,0.3)';
                            }
                        } else {
                            predBadge.innerHTML = '<span style="color:#666;">HIDDEN</span>';
                            predBadge.style.background = 'transparent';
                            predBadge.style.border = '1px solid #222';
                            predBadge.style.boxShadow = 'none';
                        }
                    }

                    uSts.innerText = uF('EXC...'); uSts.className = 'txt-blk';
                    
                    exeTrd(prediction, tAmt, (suc) => {
                        if(suc) {
                            uSts.innerText = uF('OK'); uSts.className = 'txt-blk-accent';
                            sessionStorage.setItem('drx_sig', cSig); sessionStorage.setItem('drx_p_bal', st.curBal);
                            st.tradesDone++;
                        } else { uSts.innerText = uF('ERR'); uSts.className = 'txt-blk-err'; }
                        setTimeout(() => { st.isTrd = false; }, 1000); 
                    });
                }, 1000);
            } else if(!st.isTrd) { uSts.innerText = uF('SCAN'); uSts.className = 'txt-blk'; }
        }
    };

    goBtn.onclick = () => {
        let a = parseFloat(tgtInp.value); if(!a || a <= 0) return;
        
        if (st.mode === 'DIV' && mInp.value) {
            let steps = parseInt(mInp.value);
            if (steps > 0) {
                st.extVal = steps; 
                let units = Math.pow(2, steps) - 1;
                let base = Math.floor(st.curBal / units);
                if (base < 1) base = 1;
                let seq = [];
                let val = base;
                for (let i = 0; i < steps; i++) {
                    seq.push(val);
                    val = val * 2;
                }
                st.dynSeq = seq;
            } else {
                alert('Invalid DIV steps');
                return;
            }
        } else if (st.mode === 'DBL' && mInp.value) {
            let base = parseFloat(mInp.value);
            if (base > 0) {
                st.extVal = base; 
            } else {
                alert('Invalid DBL base amount');
                return;
            }
        } else {
            st.extVal = parseFloat(mInp.value) || 0;
        }
        
        clearInterval(st.preScn);
        
        st.tradesDone = 0;
        if (st.timeLimit !== 'NO' && parseInt(st.timeLimit) > 0) {
            st.maxTrades = parseInt(st.timeLimit) * 2;
        } else {
            st.maxTrades = 0;
        }

        VoiceEngine.speak("System engine activated. Fetching API prediction.");

        scnUI(() => {
            sessionStorage.removeItem('drx_sig'); sessionStorage.removeItem('drx_p_bal');
            chkBal(); st.tgtAmt = a; 
            if (st.mode !== 'DIV' || !mInp.value) {
                st.dynSeq = calcSeq(st.curBal, st.tgtAmt);
            }
            st.stpIdx = 0; 
            st.wins = 0;
            st.losses = 0;
            st.lastPred = null;
            document.getElementById('ui-tgt').innerText = uF(a);
            let uiWl = document.getElementById('ui-wl');
            if (uiWl) uiWl.innerHTML = '<span style="color:#0f0;">0W</span> / <span style="color:#f00;">0L</span>';
            let uiStpNo = document.getElementById('ui-stp-no');
            if (uiStpNo) uiStpNo.innerText = 'STEP 1';
            let uiPredBadge = document.getElementById('ui-pred-badge');
            if (uiPredBadge) {
                uiPredBadge.innerHTML = uF('WAIT');
                uiPredBadge.style.background = 'rgba(255,255,255,0.06)';
                uiPredBadge.style.border = '1px solid rgba(255,255,255,0.15)';
                uiPredBadge.style.boxShadow = 'none';
            }
            
            let tm = ext(d.S);
            let sDig = (tm.join(" ").match(/\b\d\b/g) || tm.join(" ").match(/\d/g));
            if (sDig && sDig.length >= 5) sessionStorage.setItem('drx_sig', sDig.slice(0, 5).join("-"));

            p1.style.display = 'none'; p2.style.display = 'block';
            lkOvl.style.display = 'block'; document.body.style.overflow = 'hidden';

            ApiPredEngine.getPrediction().then(res => {
                let uiAi = document.getElementById('ui-ai');
                if (uiAi) uiAi.innerText = res.displayText;
            });

            st.isRun = true; st.isTrd = false; sessionStorage.setItem('drx_p_bal', st.curBal);
            document.getElementById('ui-sts').innerText = uF('RDY');
            st.autoInt = setInterval(loopTask, 1000);
            
            if(st.balanceCheckInterval) clearInterval(st.balanceCheckInterval);
            st.balanceCheckInterval = setInterval(() => {
                if(!st.isRun) return;
                let currentBal = chkBal();
                if(currentBal >= st.tgtAmt && currentBal > 0) {
                    st.isRun = false;
                    st.isTrd = false;
                    clearInterval(st.autoInt);
                    clearInterval(st.balanceCheckInterval);
                    st.balanceCheckInterval = null;
                    const uSts = document.getElementById('ui-sts');
                    if(uSts) { uSts.innerText = uF('DONE'); uSts.className = 'txt-blk-accent'; }
                    const uBal = document.getElementById('ui-bal');
                    if(uBal) { uBal.innerText = uF(`${currentBal.toFixed(2)} (DONE)`); }
                    const sBtn = document.querySelector('.drx-in button:last-child');
                    if(sBtn) {
                        sBtn.innerText = uF('RBT');
                        sBtn.onclick = () => {
                            p2.style.display = 'none'; p1.style.display = 'block'; sBtn.innerText = uF('STOP');
                            st.preScn = setInterval(() => { let b = chkBal(); document.getElementById('pre-bal').innerText = uF(b > 0 ? b.toFixed(2) : '--'); }, 1000);
                        };
                    }
                    lkOvl.style.display = 'none';
                    document.body.style.overflow = '';
                    VoiceEngine.speak("Target reached. Auto trade stopped.");
                }
            }, 300);
        });
    };

    stpBtn.onclick = () => {
        st.isRun = false; clearInterval(st.autoInt); if(st.balanceCheckInterval) clearInterval(st.balanceCheckInterval); st.balanceCheckInterval = null;
        sessionStorage.removeItem('drx_sig'); sessionStorage.removeItem('drx_p_bal');
        document.getElementById('ui-sts').innerText = uF('HLT'); document.getElementById('ui-sts').className = 'txt-blk-err';
        lkOvl.style.display = 'none'; document.body.style.overflow = '';
        
        stpBtn.innerText = uF('RBT');
        stpBtn.onclick = () => {
            p2.style.display = 'none'; p1.style.display = 'block'; stpBtn.innerText = uF('STOP');
            st.preScn = setInterval(() => { let b = chkBal(); document.getElementById('pre-bal').innerText = uF(b > 0 ? b.toFixed(2) : '--'); }, 1000);
        };
    };

})();
