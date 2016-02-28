(function() {
  var _aa, _ab, _ac, _ad, _ae, _af, _ag, _ah, _ai, _aj, _ak, _al, _am, _an, _ao, _ap, _aq, _ar, _as, _at, _au, _av, _aw, _ax, _ay, _az, _ba, _bb, _bc, _bd, _be, _bf, _bg, _bh, _bi, _bj, _bk, _bl, _bm, _bn, _bo, _bp, _bq, _br, _bs, _bt, _bu, _bv, _bw, _bx, _by, _bz, _ca, _cb, _cc, _cd, _ce, _cf, _cg, _ch, _ci, _cj, _ck, _cl, _cm, _cn, _co, _cp, _cq, _cr, _cs, _ct, _cu, _cv, _cw, _cx, _cy, _cz, _da, _db, _dc, _dd, _de, _df, _dg, _dh, _di, _dj, _dk, _dl, _dm, _dn, _do, _dp, _dq, _dr, _ds, _dt, _du, _dv, _dw, _dx, _dy, _dz, _ea, _eb, _ec, _ed, _ee, _ef, _eg, _eh, _ei, _ej, _ek, _el, _em, _en, _eo, _ep, _eq, _er, _es, _et, _eu, _ev, _ew, _ex, _ey, _ez, _fa, _fb, _fc, _fd, _fe, _ff, _fg, _fh, _fi, _fj, _fk, _fl, _fm, _fn, _fo, _fp, _fq, _fr, _fs, _ft, _fu, _fv, _fw, _fx, _fy, _fz, _ga, _gb, _gc, _gd, _ge, _gf, _gg, _gh, _gi, _gj, _gk, _gl, _gm, _gn, _go, _gp, _gq, _gr, _gs, _gt, _gu, _gv, _gw, _gx, _gy, _gz, _ha, _hb, _hc, _hd, _he, _hf, _hg, _hh, _hi, _hj, _hk, _hl, _hm, _hn, _ho, _hp, _hq, _hr, _hs, _ht, _hu, _hv, _hw, _hx, _hy, _hz, _i, _ia, _ib, _ic, _id, _ie, _if, _ig, _ih, _ii, _ij, _ik, _il, _im, _in, _io, _ip, _iq, _ir, _is, _it, _iu, _iv, _iw, _ix, _iy, _iz, _j, _ja, _jb, _jc, _k, _l, _m, _n, _o, _p, _q, _r, _results, _results1, _results10, _results100, _results101, _results102, _results103, _results104, _results105, _results106, _results107, _results108, _results109, _results11, _results110, _results111, _results112, _results113, _results114, _results115, _results116, _results117, _results118, _results119, _results12, _results120, _results121, _results122, _results123, _results124, _results125, _results126, _results127, _results128, _results129, _results13, _results130, _results131, _results132, _results133, _results134, _results135, _results136, _results137, _results138, _results139, _results14, _results140, _results141, _results142, _results143, _results144, _results145, _results146, _results147, _results148, _results149, _results15, _results150, _results151, _results152, _results153, _results154, _results155, _results156, _results157, _results158, _results159, _results16, _results160, _results161, _results162, _results163, _results164, _results165, _results166, _results167, _results168, _results169, _results17, _results170, _results171, _results172, _results173, _results174, _results175, _results176, _results177, _results178, _results179, _results18, _results180, _results181, _results182, _results183, _results184, _results185, _results186, _results187, _results188, _results189, _results19, _results190, _results191, _results192, _results193, _results194, _results195, _results196, _results197, _results198, _results199, _results2, _results20, _results200, _results201, _results202, _results203, _results204, _results205, _results206, _results207, _results208, _results209, _results21, _results210, _results211, _results212, _results213, _results214, _results215, _results216, _results217, _results218, _results219, _results22, _results220, _results221, _results222, _results223, _results224, _results225, _results226, _results227, _results228, _results229, _results23, _results230, _results231, _results232, _results233, _results234, _results235, _results236, _results237, _results238, _results239, _results24, _results240, _results241, _results242, _results243, _results244, _results245, _results246, _results247, _results248, _results249, _results25, _results250, _results251, _results252, _results253, _results254, _results26, _results27, _results28, _results29, _results3, _results30, _results31, _results32, _results33, _results34, _results35, _results36, _results37, _results38, _results39, _results4, _results40, _results41, _results42, _results43, _results44, _results45, _results46, _results47, _results48, _results49, _results5, _results50, _results51, _results52, _results53, _results54, _results55, _results56, _results57, _results58, _results59, _results6, _results60, _results61, _results62, _results63, _results64, _results65, _results66, _results67, _results68, _results69, _results7, _results70, _results71, _results72, _results73, _results74, _results75, _results76, _results77, _results78, _results79, _results8, _results80, _results81, _results82, _results83, _results84, _results85, _results86, _results87, _results88, _results89, _results9, _results90, _results91, _results92, _results93, _results94, _results95, _results96, _results97, _results98, _results99, _s, _t, _u, _v, _w, _x, _y, _z;

  module.exports = [
    [
      (function() {
        _results = [];
        for (_i = 0x0000; _i <= 127; _i++){ _results.push(_i); }
        return _results;
      }).apply(this), "C0 Controls and Basic Latin"
    ], [
      (function() {
        _results1 = [];
        for (_j = 0x0080; _j <= 255; _j++){ _results1.push(_j); }
        return _results1;
      }).apply(this), "C1 Controls and Latin-1 Supplement"
    ], [
      (function() {
        _results2 = [];
        for (_k = 0x0100; _k <= 383; _k++){ _results2.push(_k); }
        return _results2;
      }).apply(this), "Latin Extended-A"
    ], [
      (function() {
        _results3 = [];
        for (_l = 0x0180; _l <= 591; _l++){ _results3.push(_l); }
        return _results3;
      }).apply(this), "Latin Extended-B"
    ], [
      (function() {
        _results4 = [];
        for (_m = 0x0250; _m <= 687; _m++){ _results4.push(_m); }
        return _results4;
      }).apply(this), "IPA Extensions"
    ], [
      (function() {
        _results5 = [];
        for (_n = 0x02B0; _n <= 767; _n++){ _results5.push(_n); }
        return _results5;
      }).apply(this), "Spacing Modifier Letters"
    ], [
      (function() {
        _results6 = [];
        for (_o = 0x0300; _o <= 879; _o++){ _results6.push(_o); }
        return _results6;
      }).apply(this), "Combining Diacritical Marks"
    ], [
      (function() {
        _results7 = [];
        for (_p = 0x0370; _p <= 1023; _p++){ _results7.push(_p); }
        return _results7;
      }).apply(this), "Greek and Coptic"
    ], [
      (function() {
        _results8 = [];
        for (_q = 0x0400; _q <= 1279; _q++){ _results8.push(_q); }
        return _results8;
      }).apply(this), "Cyrillic"
    ], [
      (function() {
        _results9 = [];
        for (_r = 0x0500; _r <= 1327; _r++){ _results9.push(_r); }
        return _results9;
      }).apply(this), "Cyrillic Supplement"
    ], [
      (function() {
        _results10 = [];
        for (_s = 0x0530; _s <= 1423; _s++){ _results10.push(_s); }
        return _results10;
      }).apply(this), "Armenian"
    ], [
      (function() {
        _results11 = [];
        for (_t = 0x0590; _t <= 1535; _t++){ _results11.push(_t); }
        return _results11;
      }).apply(this), "Hebrew"
    ], [
      (function() {
        _results12 = [];
        for (_u = 0x0600; _u <= 1791; _u++){ _results12.push(_u); }
        return _results12;
      }).apply(this), "Arabic"
    ], [
      (function() {
        _results13 = [];
        for (_v = 0x0700; _v <= 1871; _v++){ _results13.push(_v); }
        return _results13;
      }).apply(this), "Syriac"
    ], [
      (function() {
        _results14 = [];
        for (_w = 0x0750; _w <= 1919; _w++){ _results14.push(_w); }
        return _results14;
      }).apply(this), "Arabic Supplement"
    ], [
      (function() {
        _results15 = [];
        for (_x = 0x0780; _x <= 1983; _x++){ _results15.push(_x); }
        return _results15;
      }).apply(this), "Thaana"
    ], [
      (function() {
        _results16 = [];
        for (_y = 0x07C0; _y <= 2047; _y++){ _results16.push(_y); }
        return _results16;
      }).apply(this), "NKo"
    ], [
      (function() {
        _results17 = [];
        for (_z = 0x0800; _z <= 2111; _z++){ _results17.push(_z); }
        return _results17;
      }).apply(this), "Samaritan"
    ], [
      (function() {
        _results18 = [];
        for (_aa = 0x0840; _aa <= 2143; _aa++){ _results18.push(_aa); }
        return _results18;
      }).apply(this), "Mandaic"
    ], [
      (function() {
        _results19 = [];
        for (_ab = 0x08A0; _ab <= 2303; _ab++){ _results19.push(_ab); }
        return _results19;
      }).apply(this), "Arabic Extended-A"
    ], [
      (function() {
        _results20 = [];
        for (_ac = 0x0900; _ac <= 2431; _ac++){ _results20.push(_ac); }
        return _results20;
      }).apply(this), "Devanagari"
    ], [
      (function() {
        _results21 = [];
        for (_ad = 0x0980; _ad <= 2559; _ad++){ _results21.push(_ad); }
        return _results21;
      }).apply(this), "Bengali"
    ], [
      (function() {
        _results22 = [];
        for (_ae = 0x0A00; _ae <= 2687; _ae++){ _results22.push(_ae); }
        return _results22;
      }).apply(this), "Gurmukhi"
    ], [
      (function() {
        _results23 = [];
        for (_af = 0x0A80; _af <= 2815; _af++){ _results23.push(_af); }
        return _results23;
      }).apply(this), "Gujarati"
    ], [
      (function() {
        _results24 = [];
        for (_ag = 0x0B00; _ag <= 2943; _ag++){ _results24.push(_ag); }
        return _results24;
      }).apply(this), "Oriya"
    ], [
      (function() {
        _results25 = [];
        for (_ah = 0x0B80; _ah <= 3071; _ah++){ _results25.push(_ah); }
        return _results25;
      }).apply(this), "Tamil"
    ], [
      (function() {
        _results26 = [];
        for (_ai = 0x0C00; _ai <= 3199; _ai++){ _results26.push(_ai); }
        return _results26;
      }).apply(this), "Telugu"
    ], [
      (function() {
        _results27 = [];
        for (_aj = 0x0C80; _aj <= 3327; _aj++){ _results27.push(_aj); }
        return _results27;
      }).apply(this), "Kannada"
    ], [
      (function() {
        _results28 = [];
        for (_ak = 0x0D00; _ak <= 3455; _ak++){ _results28.push(_ak); }
        return _results28;
      }).apply(this), "Malayalam"
    ], [
      (function() {
        _results29 = [];
        for (_al = 0x0D80; _al <= 3583; _al++){ _results29.push(_al); }
        return _results29;
      }).apply(this), "Sinhala"
    ], [
      (function() {
        _results30 = [];
        for (_am = 0x0E00; _am <= 3711; _am++){ _results30.push(_am); }
        return _results30;
      }).apply(this), "Thai"
    ], [
      (function() {
        _results31 = [];
        for (_an = 0x0E80; _an <= 3839; _an++){ _results31.push(_an); }
        return _results31;
      }).apply(this), "Lao"
    ], [
      (function() {
        _results32 = [];
        for (_ao = 0x0F00; _ao <= 4095; _ao++){ _results32.push(_ao); }
        return _results32;
      }).apply(this), "Tibetan"
    ], [
      (function() {
        _results33 = [];
        for (_ap = 0x1000; _ap <= 4255; _ap++){ _results33.push(_ap); }
        return _results33;
      }).apply(this), "Myanmar"
    ], [
      (function() {
        _results34 = [];
        for (_aq = 0x10A0; _aq <= 4351; _aq++){ _results34.push(_aq); }
        return _results34;
      }).apply(this), "Georgian"
    ], [
      (function() {
        _results35 = [];
        for (_ar = 0x1100; _ar <= 4607; _ar++){ _results35.push(_ar); }
        return _results35;
      }).apply(this), "Hangul Jamo"
    ], [
      (function() {
        _results36 = [];
        for (_as = 0x1200; _as <= 4991; _as++){ _results36.push(_as); }
        return _results36;
      }).apply(this), "Ethiopic"
    ], [
      (function() {
        _results37 = [];
        for (_at = 0x1380; _at <= 5023; _at++){ _results37.push(_at); }
        return _results37;
      }).apply(this), "Ethiopic Supplement"
    ], [
      (function() {
        _results38 = [];
        for (_au = 0x13A0; _au <= 5119; _au++){ _results38.push(_au); }
        return _results38;
      }).apply(this), "Cherokee"
    ], [
      (function() {
        _results39 = [];
        for (_av = 0x1400; _av <= 5759; _av++){ _results39.push(_av); }
        return _results39;
      }).apply(this), "Unified Canadian Aboriginal Syllabics"
    ], [
      (function() {
        _results40 = [];
        for (_aw = 0x1680; _aw <= 5791; _aw++){ _results40.push(_aw); }
        return _results40;
      }).apply(this), "Ogham"
    ], [
      (function() {
        _results41 = [];
        for (_ax = 0x16A0; _ax <= 5887; _ax++){ _results41.push(_ax); }
        return _results41;
      }).apply(this), "Runic"
    ], [
      (function() {
        _results42 = [];
        for (_ay = 0x1700; _ay <= 5919; _ay++){ _results42.push(_ay); }
        return _results42;
      }).apply(this), "Tagalog"
    ], [
      (function() {
        _results43 = [];
        for (_az = 0x1720; _az <= 5951; _az++){ _results43.push(_az); }
        return _results43;
      }).apply(this), "Hanunoo"
    ], [
      (function() {
        _results44 = [];
        for (_ba = 0x1740; _ba <= 5983; _ba++){ _results44.push(_ba); }
        return _results44;
      }).apply(this), "Buhid"
    ], [
      (function() {
        _results45 = [];
        for (_bb = 0x1760; _bb <= 6015; _bb++){ _results45.push(_bb); }
        return _results45;
      }).apply(this), "Tagbanwa"
    ], [
      (function() {
        _results46 = [];
        for (_bc = 0x1780; _bc <= 6143; _bc++){ _results46.push(_bc); }
        return _results46;
      }).apply(this), "Khmer"
    ], [
      (function() {
        _results47 = [];
        for (_bd = 0x1800; _bd <= 6319; _bd++){ _results47.push(_bd); }
        return _results47;
      }).apply(this), "Mongolian"
    ], [
      (function() {
        _results48 = [];
        for (_be = 0x18B0; _be <= 6399; _be++){ _results48.push(_be); }
        return _results48;
      }).apply(this), "Unified Canadian Aboriginal Syllabics Extended"
    ], [
      (function() {
        _results49 = [];
        for (_bf = 0x1900; _bf <= 6479; _bf++){ _results49.push(_bf); }
        return _results49;
      }).apply(this), "Limbu"
    ], [
      (function() {
        _results50 = [];
        for (_bg = 0x1950; _bg <= 6527; _bg++){ _results50.push(_bg); }
        return _results50;
      }).apply(this), "Tai Le"
    ], [
      (function() {
        _results51 = [];
        for (_bh = 0x1980; _bh <= 6623; _bh++){ _results51.push(_bh); }
        return _results51;
      }).apply(this), "New Tai Lue"
    ], [
      (function() {
        _results52 = [];
        for (_bi = 0x19E0; _bi <= 6655; _bi++){ _results52.push(_bi); }
        return _results52;
      }).apply(this), "Khmer Symbols"
    ], [
      (function() {
        _results53 = [];
        for (_bj = 0x1A00; _bj <= 6687; _bj++){ _results53.push(_bj); }
        return _results53;
      }).apply(this), "Buginese"
    ], [
      (function() {
        _results54 = [];
        for (_bk = 0x1A20; _bk <= 6831; _bk++){ _results54.push(_bk); }
        return _results54;
      }).apply(this), "Tai Tham"
    ], [
      (function() {
        _results55 = [];
        for (_bl = 0x1AB0; _bl <= 6911; _bl++){ _results55.push(_bl); }
        return _results55;
      }).apply(this), "Combining Diacritical Marks Extended"
    ], [
      (function() {
        _results56 = [];
        for (_bm = 0x1B00; _bm <= 7039; _bm++){ _results56.push(_bm); }
        return _results56;
      }).apply(this), "Balinese"
    ], [
      (function() {
        _results57 = [];
        for (_bn = 0x1B80; _bn <= 7103; _bn++){ _results57.push(_bn); }
        return _results57;
      }).apply(this), "Sundanese"
    ], [
      (function() {
        _results58 = [];
        for (_bo = 0x1BC0; _bo <= 7167; _bo++){ _results58.push(_bo); }
        return _results58;
      }).apply(this), "Batak"
    ], [
      (function() {
        _results59 = [];
        for (_bp = 0x1C00; _bp <= 7247; _bp++){ _results59.push(_bp); }
        return _results59;
      }).apply(this), "Lepcha"
    ], [
      (function() {
        _results60 = [];
        for (_bq = 0x1C50; _bq <= 7295; _bq++){ _results60.push(_bq); }
        return _results60;
      }).apply(this), "Ol Chiki"
    ], [[7360, 7361, 7362, 7363, 7364, 7365, 7366, 7367, 7368, 7369, 7370, 7371, 7372, 7373, 7374, 7375], "Sundanese Supplement"], [
      (function() {
        _results61 = [];
        for (_br = 0x1CD0; _br <= 7423; _br++){ _results61.push(_br); }
        return _results61;
      }).apply(this), "Vedic Extensions"
    ], [
      (function() {
        _results62 = [];
        for (_bs = 0x1D00; _bs <= 7551; _bs++){ _results62.push(_bs); }
        return _results62;
      }).apply(this), "Phonetic Extensions"
    ], [
      (function() {
        _results63 = [];
        for (_bt = 0x1D80; _bt <= 7615; _bt++){ _results63.push(_bt); }
        return _results63;
      }).apply(this), "Phonetic Extensions Supplement"
    ], [
      (function() {
        _results64 = [];
        for (_bu = 0x1DC0; _bu <= 7679; _bu++){ _results64.push(_bu); }
        return _results64;
      }).apply(this), "Combining Diacritical Marks Supplement"
    ], [
      (function() {
        _results65 = [];
        for (_bv = 0x1E00; _bv <= 7935; _bv++){ _results65.push(_bv); }
        return _results65;
      }).apply(this), "Latin Extended Additional"
    ], [
      (function() {
        _results66 = [];
        for (_bw = 0x1F00; _bw <= 8191; _bw++){ _results66.push(_bw); }
        return _results66;
      }).apply(this), "Greek Extended"
    ], [
      (function() {
        _results67 = [];
        for (_bx = 0x2000; _bx <= 8303; _bx++){ _results67.push(_bx); }
        return _results67;
      }).apply(this), "General Punctuation"
    ], [
      (function() {
        _results68 = [];
        for (_by = 0x2070; _by <= 8351; _by++){ _results68.push(_by); }
        return _results68;
      }).apply(this), "Superscripts and Subscripts"
    ], [
      (function() {
        _results69 = [];
        for (_bz = 0x20A0; _bz <= 8399; _bz++){ _results69.push(_bz); }
        return _results69;
      }).apply(this), "Currency Symbols"
    ], [
      (function() {
        _results70 = [];
        for (_ca = 0x20D0; _ca <= 8447; _ca++){ _results70.push(_ca); }
        return _results70;
      }).apply(this), "Combining Diacritical Marks for Symbols"
    ], [
      (function() {
        _results71 = [];
        for (_cb = 0x2100; _cb <= 8527; _cb++){ _results71.push(_cb); }
        return _results71;
      }).apply(this), "Letterlike Symbols"
    ], [
      (function() {
        _results72 = [];
        for (_cc = 0x2150; _cc <= 8591; _cc++){ _results72.push(_cc); }
        return _results72;
      }).apply(this), "Number Forms"
    ], [
      (function() {
        _results73 = [];
        for (_cd = 0x2190; _cd <= 8703; _cd++){ _results73.push(_cd); }
        return _results73;
      }).apply(this), "Arrows"
    ], [
      (function() {
        _results74 = [];
        for (_ce = 0x2200; _ce <= 8959; _ce++){ _results74.push(_ce); }
        return _results74;
      }).apply(this), "Mathematical Operators"
    ], [
      (function() {
        _results75 = [];
        for (_cf = 0x2300; _cf <= 9215; _cf++){ _results75.push(_cf); }
        return _results75;
      }).apply(this), "Miscellaneous Technical"
    ], [
      (function() {
        _results76 = [];
        for (_cg = 0x2400; _cg <= 9279; _cg++){ _results76.push(_cg); }
        return _results76;
      }).apply(this), "Control Pictures"
    ], [
      (function() {
        _results77 = [];
        for (_ch = 0x2440; _ch <= 9311; _ch++){ _results77.push(_ch); }
        return _results77;
      }).apply(this), "Optical Character Recognition"
    ], [
      (function() {
        _results78 = [];
        for (_ci = 0x2460; _ci <= 9471; _ci++){ _results78.push(_ci); }
        return _results78;
      }).apply(this), "Enclosed Alphanumerics"
    ], [
      (function() {
        _results79 = [];
        for (_cj = 0x2500; _cj <= 9599; _cj++){ _results79.push(_cj); }
        return _results79;
      }).apply(this), "Box Drawing"
    ], [
      (function() {
        _results80 = [];
        for (_ck = 0x2580; _ck <= 9631; _ck++){ _results80.push(_ck); }
        return _results80;
      }).apply(this), "Block Elements"
    ], [
      (function() {
        _results81 = [];
        for (_cl = 0x25A0; _cl <= 9727; _cl++){ _results81.push(_cl); }
        return _results81;
      }).apply(this), "Geometric Shapes"
    ], [
      (function() {
        _results82 = [];
        for (_cm = 0x2600; _cm <= 9983; _cm++){ _results82.push(_cm); }
        return _results82;
      }).apply(this), "Miscellaneous Symbols"
    ], [
      (function() {
        _results83 = [];
        for (_cn = 0x2700; _cn <= 10175; _cn++){ _results83.push(_cn); }
        return _results83;
      }).apply(this), "Dingbats"
    ], [
      (function() {
        _results84 = [];
        for (_co = 0x27C0; _co <= 10223; _co++){ _results84.push(_co); }
        return _results84;
      }).apply(this), "Miscellaneous Mathematical Symbols-A"
    ], [[10224, 10225, 10226, 10227, 10228, 10229, 10230, 10231, 10232, 10233, 10234, 10235, 10236, 10237, 10238, 10239], "Supplemental Arrows-A"], [
      (function() {
        _results85 = [];
        for (_cp = 0x2800; _cp <= 10495; _cp++){ _results85.push(_cp); }
        return _results85;
      }).apply(this), "Braille Patterns"
    ], [
      (function() {
        _results86 = [];
        for (_cq = 0x2900; _cq <= 10623; _cq++){ _results86.push(_cq); }
        return _results86;
      }).apply(this), "Supplemental Arrows-B"
    ], [
      (function() {
        _results87 = [];
        for (_cr = 0x2980; _cr <= 10751; _cr++){ _results87.push(_cr); }
        return _results87;
      }).apply(this), "Miscellaneous Mathematical Symbols-B"
    ], [
      (function() {
        _results88 = [];
        for (_cs = 0x2A00; _cs <= 11007; _cs++){ _results88.push(_cs); }
        return _results88;
      }).apply(this), "Supplemental Mathematical Operators"
    ], [
      (function() {
        _results89 = [];
        for (_ct = 0x2B00; _ct <= 11263; _ct++){ _results89.push(_ct); }
        return _results89;
      }).apply(this), "Miscellaneous Symbols and Arrows"
    ], [
      (function() {
        _results90 = [];
        for (_cu = 0x2C00; _cu <= 11359; _cu++){ _results90.push(_cu); }
        return _results90;
      }).apply(this), "Glagolitic"
    ], [
      (function() {
        _results91 = [];
        for (_cv = 0x2C60; _cv <= 11391; _cv++){ _results91.push(_cv); }
        return _results91;
      }).apply(this), "Latin Extended-C"
    ], [
      (function() {
        _results92 = [];
        for (_cw = 0x2C80; _cw <= 11519; _cw++){ _results92.push(_cw); }
        return _results92;
      }).apply(this), "Coptic"
    ], [
      (function() {
        _results93 = [];
        for (_cx = 0x2D00; _cx <= 11567; _cx++){ _results93.push(_cx); }
        return _results93;
      }).apply(this), "Georgian Supplement"
    ], [
      (function() {
        _results94 = [];
        for (_cy = 0x2D30; _cy <= 11647; _cy++){ _results94.push(_cy); }
        return _results94;
      }).apply(this), "Tifinagh"
    ], [
      (function() {
        _results95 = [];
        for (_cz = 0x2D80; _cz <= 11743; _cz++){ _results95.push(_cz); }
        return _results95;
      }).apply(this), "Ethiopic Extended"
    ], [
      (function() {
        _results96 = [];
        for (_da = 0x2DE0; _da <= 11775; _da++){ _results96.push(_da); }
        return _results96;
      }).apply(this), "Cyrillic Extended-A"
    ], [
      (function() {
        _results97 = [];
        for (_db = 0x2E00; _db <= 11903; _db++){ _results97.push(_db); }
        return _results97;
      }).apply(this), "Supplemental Punctuation"
    ], [
      (function() {
        _results98 = [];
        for (_dc = 0x2E80; _dc <= 12031; _dc++){ _results98.push(_dc); }
        return _results98;
      }).apply(this), "CJK Radicals Supplement"
    ], [
      (function() {
        _results99 = [];
        for (_dd = 0x2F00; _dd <= 12255; _dd++){ _results99.push(_dd); }
        return _results99;
      }).apply(this), "Kangxi Radicals"
    ], [[12272, 12273, 12274, 12275, 12276, 12277, 12278, 12279, 12280, 12281, 12282, 12283, 12284, 12285, 12286, 12287], "Ideographic Description Characters"], [
      (function() {
        _results100 = [];
        for (_de = 0x3000; _de <= 12351; _de++){ _results100.push(_de); }
        return _results100;
      }).apply(this), "CJK Symbols and Punctuation"
    ], [
      (function() {
        _results101 = [];
        for (_df = 0x3040; _df <= 12447; _df++){ _results101.push(_df); }
        return _results101;
      }).apply(this), "Hiragana"
    ], [
      (function() {
        _results102 = [];
        for (_dg = 0x30A0; _dg <= 12543; _dg++){ _results102.push(_dg); }
        return _results102;
      }).apply(this), "Katakana"
    ], [
      (function() {
        _results103 = [];
        for (_dh = 0x3100; _dh <= 12591; _dh++){ _results103.push(_dh); }
        return _results103;
      }).apply(this), "Bopomofo"
    ], [
      (function() {
        _results104 = [];
        for (_di = 0x3130; _di <= 12687; _di++){ _results104.push(_di); }
        return _results104;
      }).apply(this), "Hangul Compatibility Jamo"
    ], [[12688, 12689, 12690, 12691, 12692, 12693, 12694, 12695, 12696, 12697, 12698, 12699, 12700, 12701, 12702, 12703], "Kanbun"], [
      (function() {
        _results105 = [];
        for (_dj = 0x31A0; _dj <= 12735; _dj++){ _results105.push(_dj); }
        return _results105;
      }).apply(this), "Bopomofo Extended"
    ], [
      (function() {
        _results106 = [];
        for (_dk = 0x31C0; _dk <= 12783; _dk++){ _results106.push(_dk); }
        return _results106;
      }).apply(this), "CJK Strokes"
    ], [[12784, 12785, 12786, 12787, 12788, 12789, 12790, 12791, 12792, 12793, 12794, 12795, 12796, 12797, 12798, 12799], "Katakana Phonetic Extensions"], [
      (function() {
        _results107 = [];
        for (_dl = 0x3200; _dl <= 13055; _dl++){ _results107.push(_dl); }
        return _results107;
      }).apply(this), "Enclosed CJK Letters and Months"
    ], [
      (function() {
        _results108 = [];
        for (_dm = 0x3300; _dm <= 13311; _dm++){ _results108.push(_dm); }
        return _results108;
      }).apply(this), "CJK Compatibility"
    ], [
      (function() {
        _results109 = [];
        for (_dn = 0x3400; _dn <= 19893; _dn++){ _results109.push(_dn); }
        return _results109;
      }).apply(this), "CJK Unified Ideographs Extension A"
    ], [
      (function() {
        _results110 = [];
        for (_do = 0x4DC0; _do <= 19967; _do++){ _results110.push(_do); }
        return _results110;
      }).apply(this), "Yijing Hexagram Symbols"
    ], [
      (function() {
        _results111 = [];
        for (_dp = 0x4E00; _dp <= 40908; _dp++){ _results111.push(_dp); }
        return _results111;
      }).apply(this), "CJK Unified Ideographs"
    ], [
      (function() {
        _results112 = [];
        for (_dq = 0xA000; _dq <= 42127; _dq++){ _results112.push(_dq); }
        return _results112;
      }).apply(this), "Yi Syllables"
    ], [
      (function() {
        _results113 = [];
        for (_dr = 0xA490; _dr <= 42191; _dr++){ _results113.push(_dr); }
        return _results113;
      }).apply(this), "Yi Radicals"
    ], [
      (function() {
        _results114 = [];
        for (_ds = 0xA4D0; _ds <= 42239; _ds++){ _results114.push(_ds); }
        return _results114;
      }).apply(this), "Lisu"
    ], [
      (function() {
        _results115 = [];
        for (_dt = 0xA500; _dt <= 42559; _dt++){ _results115.push(_dt); }
        return _results115;
      }).apply(this), "Vai"
    ], [
      (function() {
        _results116 = [];
        for (_du = 0xA640; _du <= 42655; _du++){ _results116.push(_du); }
        return _results116;
      }).apply(this), "Cyrillic Extended-B"
    ], [
      (function() {
        _results117 = [];
        for (_dv = 0xA6A0; _dv <= 42751; _dv++){ _results117.push(_dv); }
        return _results117;
      }).apply(this), "Bamum"
    ], [
      (function() {
        _results118 = [];
        for (_dw = 0xA700; _dw <= 42783; _dw++){ _results118.push(_dw); }
        return _results118;
      }).apply(this), "Modifier Tone Letters"
    ], [
      (function() {
        _results119 = [];
        for (_dx = 0xA720; _dx <= 43007; _dx++){ _results119.push(_dx); }
        return _results119;
      }).apply(this), "Latin Extended-D"
    ], [
      (function() {
        _results120 = [];
        for (_dy = 0xA800; _dy <= 43055; _dy++){ _results120.push(_dy); }
        return _results120;
      }).apply(this), "Syloti Nagri"
    ], [[43056, 43057, 43058, 43059, 43060, 43061, 43062, 43063, 43064, 43065, 43066, 43067, 43068, 43069, 43070, 43071], "Common Indic Number Forms"], [
      (function() {
        _results121 = [];
        for (_dz = 0xA840; _dz <= 43135; _dz++){ _results121.push(_dz); }
        return _results121;
      }).apply(this), "Phags-pa"
    ], [
      (function() {
        _results122 = [];
        for (_ea = 0xA880; _ea <= 43231; _ea++){ _results122.push(_ea); }
        return _results122;
      }).apply(this), "Saurashtra"
    ], [
      (function() {
        _results123 = [];
        for (_eb = 0xA8E0; _eb <= 43263; _eb++){ _results123.push(_eb); }
        return _results123;
      }).apply(this), "Devanagari Extended"
    ], [
      (function() {
        _results124 = [];
        for (_ec = 0xA900; _ec <= 43311; _ec++){ _results124.push(_ec); }
        return _results124;
      }).apply(this), "Kayah Li"
    ], [
      (function() {
        _results125 = [];
        for (_ed = 0xA930; _ed <= 43359; _ed++){ _results125.push(_ed); }
        return _results125;
      }).apply(this), "Rejang"
    ], [
      (function() {
        _results126 = [];
        for (_ee = 0xA960; _ee <= 43391; _ee++){ _results126.push(_ee); }
        return _results126;
      }).apply(this), "Hangul Jamo Extended-A"
    ], [
      (function() {
        _results127 = [];
        for (_ef = 0xA980; _ef <= 43487; _ef++){ _results127.push(_ef); }
        return _results127;
      }).apply(this), "Javanese"
    ], [
      (function() {
        _results128 = [];
        for (_eg = 0xA9E0; _eg <= 43519; _eg++){ _results128.push(_eg); }
        return _results128;
      }).apply(this), "Myanmar Extended-B"
    ], [
      (function() {
        _results129 = [];
        for (_eh = 0xAA00; _eh <= 43615; _eh++){ _results129.push(_eh); }
        return _results129;
      }).apply(this), "Cham"
    ], [
      (function() {
        _results130 = [];
        for (_ei = 0xAA60; _ei <= 43647; _ei++){ _results130.push(_ei); }
        return _results130;
      }).apply(this), "Myanmar Extended-A"
    ], [
      (function() {
        _results131 = [];
        for (_ej = 0xAA80; _ej <= 43743; _ej++){ _results131.push(_ej); }
        return _results131;
      }).apply(this), "Tai Viet"
    ], [
      (function() {
        _results132 = [];
        for (_ek = 0xAAE0; _ek <= 43775; _ek++){ _results132.push(_ek); }
        return _results132;
      }).apply(this), "Meetei Mayek Extensions"
    ], [
      (function() {
        _results133 = [];
        for (_el = 0xAB00; _el <= 43823; _el++){ _results133.push(_el); }
        return _results133;
      }).apply(this), "Ethiopic Extended-A"
    ], [
      (function() {
        _results134 = [];
        for (_em = 0xAB30; _em <= 43887; _em++){ _results134.push(_em); }
        return _results134;
      }).apply(this), "Latin Extended-E"
    ], [
      (function() {
        _results135 = [];
        for (_en = 0xABC0; _en <= 44031; _en++){ _results135.push(_en); }
        return _results135;
      }).apply(this), "Meetei Mayek"
    ], [
      (function() {
        _results136 = [];
        for (_eo = 0xAC00; _eo <= 55203; _eo++){ _results136.push(_eo); }
        return _results136;
      }).apply(this), "Hangul Syllables"
    ], [
      (function() {
        _results137 = [];
        for (_ep = 0xD7B0; _ep <= 55295; _ep++){ _results137.push(_ep); }
        return _results137;
      }).apply(this), "Hangul Jamo Extended-B"
    ], [
      (function() {
        _results138 = [];
        for (_eq = 0xD800; _eq <= 56191; _eq++){ _results138.push(_eq); }
        return _results138;
      }).apply(this), "High Surrogates"
    ], [
      (function() {
        _results139 = [];
        for (_er = 0xDB80; _er <= 56319; _er++){ _results139.push(_er); }
        return _results139;
      }).apply(this), "High Private Use Surrogates"
    ], [
      (function() {
        _results140 = [];
        for (_es = 0xDC00; _es <= 57343; _es++){ _results140.push(_es); }
        return _results140;
      }).apply(this), "Low Surrogates"
    ], [
      (function() {
        _results141 = [];
        for (_et = 0xE000; _et <= 63743; _et++){ _results141.push(_et); }
        return _results141;
      }).apply(this), "Private Use Area"
    ], [
      (function() {
        _results142 = [];
        for (_eu = 0xF900; _eu <= 64255; _eu++){ _results142.push(_eu); }
        return _results142;
      }).apply(this), "CJK Compatibility Ideographs"
    ], [
      (function() {
        _results143 = [];
        for (_ev = 0xFB00; _ev <= 64335; _ev++){ _results143.push(_ev); }
        return _results143;
      }).apply(this), "Alphabetic Presentation Forms"
    ], [
      (function() {
        _results144 = [];
        for (_ew = 0xFB50; _ew <= 65023; _ew++){ _results144.push(_ew); }
        return _results144;
      }).apply(this), "Arabic Presentation Forms-A"
    ], [[65024, 65025, 65026, 65027, 65028, 65029, 65030, 65031, 65032, 65033, 65034, 65035, 65036, 65037, 65038, 65039], "Variation Selectors"], [[65040, 65041, 65042, 65043, 65044, 65045, 65046, 65047, 65048, 65049, 65050, 65051, 65052, 65053, 65054, 65055], "Vertical Forms"], [[65056, 65057, 65058, 65059, 65060, 65061, 65062, 65063, 65064, 65065, 65066, 65067, 65068, 65069, 65070, 65071], "Combining Half Marks"], [
      (function() {
        _results145 = [];
        for (_ex = 0xFE30; _ex <= 65103; _ex++){ _results145.push(_ex); }
        return _results145;
      }).apply(this), "CJK Compatibility Forms"
    ], [
      (function() {
        _results146 = [];
        for (_ey = 0xFE50; _ey <= 65135; _ey++){ _results146.push(_ey); }
        return _results146;
      }).apply(this), "Small Form Variants"
    ], [
      (function() {
        _results147 = [];
        for (_ez = 0xFE70; _ez <= 65279; _ez++){ _results147.push(_ez); }
        return _results147;
      }).apply(this), "Arabic Presentation Forms-B"
    ], [
      (function() {
        _results148 = [];
        for (_fa = 0xFF00; _fa <= 65519; _fa++){ _results148.push(_fa); }
        return _results148;
      }).apply(this), "Halfwidth and Fullwidth Forms"
    ], [[65520, 65521, 65522, 65523, 65524, 65525, 65526, 65527, 65528, 65529, 65530, 65531, 65532, 65533, 65534, 65535], "Specials"], [
      (function() {
        _results149 = [];
        for (_fb = 0x10000; _fb <= 65663; _fb++){ _results149.push(_fb); }
        return _results149;
      }).apply(this), "Linear B Syllabary"
    ], [
      (function() {
        _results150 = [];
        for (_fc = 0x10080; _fc <= 65791; _fc++){ _results150.push(_fc); }
        return _results150;
      }).apply(this), "Linear B Ideograms"
    ], [
      (function() {
        _results151 = [];
        for (_fd = 0x10100; _fd <= 65855; _fd++){ _results151.push(_fd); }
        return _results151;
      }).apply(this), "Aegean Numbers"
    ], [
      (function() {
        _results152 = [];
        for (_fe = 0x10140; _fe <= 65935; _fe++){ _results152.push(_fe); }
        return _results152;
      }).apply(this), "Ancient Greek Numbers"
    ], [
      (function() {
        _results153 = [];
        for (_ff = 0x10190; _ff <= 65999; _ff++){ _results153.push(_ff); }
        return _results153;
      }).apply(this), "Ancient Symbols"
    ], [
      (function() {
        _results154 = [];
        for (_fg = 0x101D0; _fg <= 66047; _fg++){ _results154.push(_fg); }
        return _results154;
      }).apply(this), "Phaistos Disc"
    ], [
      (function() {
        _results155 = [];
        for (_fh = 0x10280; _fh <= 66207; _fh++){ _results155.push(_fh); }
        return _results155;
      }).apply(this), "Lycian"
    ], [
      (function() {
        _results156 = [];
        for (_fi = 0x102A0; _fi <= 66271; _fi++){ _results156.push(_fi); }
        return _results156;
      }).apply(this), "Carian"
    ], [
      (function() {
        _results157 = [];
        for (_fj = 0x102E0; _fj <= 66303; _fj++){ _results157.push(_fj); }
        return _results157;
      }).apply(this), "Coptic Epact Numbers"
    ], [
      (function() {
        _results158 = [];
        for (_fk = 0x10300; _fk <= 66351; _fk++){ _results158.push(_fk); }
        return _results158;
      }).apply(this), "Old Italic"
    ], [
      (function() {
        _results159 = [];
        for (_fl = 0x10330; _fl <= 66383; _fl++){ _results159.push(_fl); }
        return _results159;
      }).apply(this), "Gothic"
    ], [
      (function() {
        _results160 = [];
        for (_fm = 0x10350; _fm <= 66431; _fm++){ _results160.push(_fm); }
        return _results160;
      }).apply(this), "Old Permic"
    ], [
      (function() {
        _results161 = [];
        for (_fn = 0x10380; _fn <= 66463; _fn++){ _results161.push(_fn); }
        return _results161;
      }).apply(this), "Ugaritic"
    ], [
      (function() {
        _results162 = [];
        for (_fo = 0x103A0; _fo <= 66527; _fo++){ _results162.push(_fo); }
        return _results162;
      }).apply(this), "Old Persian"
    ], [
      (function() {
        _results163 = [];
        for (_fp = 0x10400; _fp <= 66639; _fp++){ _results163.push(_fp); }
        return _results163;
      }).apply(this), "Deseret"
    ], [
      (function() {
        _results164 = [];
        for (_fq = 0x10450; _fq <= 66687; _fq++){ _results164.push(_fq); }
        return _results164;
      }).apply(this), "Shavian"
    ], [
      (function() {
        _results165 = [];
        for (_fr = 0x10480; _fr <= 66735; _fr++){ _results165.push(_fr); }
        return _results165;
      }).apply(this), "Osmanya"
    ], [
      (function() {
        _results166 = [];
        for (_fs = 0x10500; _fs <= 66863; _fs++){ _results166.push(_fs); }
        return _results166;
      }).apply(this), "Elbasan"
    ], [
      (function() {
        _results167 = [];
        for (_ft = 0x10530; _ft <= 66927; _ft++){ _results167.push(_ft); }
        return _results167;
      }).apply(this), "Caucasian Albanian"
    ], [
      (function() {
        _results168 = [];
        for (_fu = 0x10600; _fu <= 67455; _fu++){ _results168.push(_fu); }
        return _results168;
      }).apply(this), "Linear A"
    ], [
      (function() {
        _results169 = [];
        for (_fv = 0x10800; _fv <= 67647; _fv++){ _results169.push(_fv); }
        return _results169;
      }).apply(this), "Cypriot Syllabary"
    ], [
      (function() {
        _results170 = [];
        for (_fw = 0x10840; _fw <= 67679; _fw++){ _results170.push(_fw); }
        return _results170;
      }).apply(this), "Imperial Aramaic"
    ], [
      (function() {
        _results171 = [];
        for (_fx = 0x10860; _fx <= 67711; _fx++){ _results171.push(_fx); }
        return _results171;
      }).apply(this), "Palmyrene"
    ], [
      (function() {
        _results172 = [];
        for (_fy = 0x10880; _fy <= 67759; _fy++){ _results172.push(_fy); }
        return _results172;
      }).apply(this), "Nabataean"
    ], [
      (function() {
        _results173 = [];
        for (_fz = 0x10900; _fz <= 67871; _fz++){ _results173.push(_fz); }
        return _results173;
      }).apply(this), "Phoenician"
    ], [
      (function() {
        _results174 = [];
        for (_ga = 0x10920; _ga <= 67903; _ga++){ _results174.push(_ga); }
        return _results174;
      }).apply(this), "Lydian"
    ], [
      (function() {
        _results175 = [];
        for (_gb = 0x10980; _gb <= 67999; _gb++){ _results175.push(_gb); }
        return _results175;
      }).apply(this), "Meroitic Hieroglyphs"
    ], [
      (function() {
        _results176 = [];
        for (_gc = 0x109A0; _gc <= 68095; _gc++){ _results176.push(_gc); }
        return _results176;
      }).apply(this), "Meroitic Cursive"
    ], [
      (function() {
        _results177 = [];
        for (_gd = 0x10A00; _gd <= 68191; _gd++){ _results177.push(_gd); }
        return _results177;
      }).apply(this), "Kharoshthi"
    ], [
      (function() {
        _results178 = [];
        for (_ge = 0x10A60; _ge <= 68223; _ge++){ _results178.push(_ge); }
        return _results178;
      }).apply(this), "Old South Arabian"
    ], [
      (function() {
        _results179 = [];
        for (_gf = 0x10A80; _gf <= 68255; _gf++){ _results179.push(_gf); }
        return _results179;
      }).apply(this), "Old North Arabian"
    ], [
      (function() {
        _results180 = [];
        for (_gg = 0x10AC0; _gg <= 68351; _gg++){ _results180.push(_gg); }
        return _results180;
      }).apply(this), "Manichaean"
    ], [
      (function() {
        _results181 = [];
        for (_gh = 0x10B00; _gh <= 68415; _gh++){ _results181.push(_gh); }
        return _results181;
      }).apply(this), "Avestan"
    ], [
      (function() {
        _results182 = [];
        for (_gi = 0x10B40; _gi <= 68447; _gi++){ _results182.push(_gi); }
        return _results182;
      }).apply(this), "Inscriptional Parthian"
    ], [
      (function() {
        _results183 = [];
        for (_gj = 0x10B60; _gj <= 68479; _gj++){ _results183.push(_gj); }
        return _results183;
      }).apply(this), "Inscriptional Pahlavi"
    ], [
      (function() {
        _results184 = [];
        for (_gk = 0x10B80; _gk <= 68527; _gk++){ _results184.push(_gk); }
        return _results184;
      }).apply(this), "Psalter Pahlavi"
    ], [
      (function() {
        _results185 = [];
        for (_gl = 0x10C00; _gl <= 68687; _gl++){ _results185.push(_gl); }
        return _results185;
      }).apply(this), "Old Turkic"
    ], [
      (function() {
        _results186 = [];
        for (_gm = 0x10E60; _gm <= 69247; _gm++){ _results186.push(_gm); }
        return _results186;
      }).apply(this), "Rumi Numeral Symbols"
    ], [
      (function() {
        _results187 = [];
        for (_gn = 0x11000; _gn <= 69759; _gn++){ _results187.push(_gn); }
        return _results187;
      }).apply(this), "Brahmi"
    ], [
      (function() {
        _results188 = [];
        for (_go = 0x11080; _go <= 69839; _go++){ _results188.push(_go); }
        return _results188;
      }).apply(this), "Kaithi"
    ], [
      (function() {
        _results189 = [];
        for (_gp = 0x110D0; _gp <= 69887; _gp++){ _results189.push(_gp); }
        return _results189;
      }).apply(this), "Sora Sompeng"
    ], [
      (function() {
        _results190 = [];
        for (_gq = 0x11100; _gq <= 69967; _gq++){ _results190.push(_gq); }
        return _results190;
      }).apply(this), "Chakma"
    ], [
      (function() {
        _results191 = [];
        for (_gr = 0x11150; _gr <= 70015; _gr++){ _results191.push(_gr); }
        return _results191;
      }).apply(this), "Mahajani"
    ], [
      (function() {
        _results192 = [];
        for (_gs = 0x11180; _gs <= 70111; _gs++){ _results192.push(_gs); }
        return _results192;
      }).apply(this), "Sharada"
    ], [
      (function() {
        _results193 = [];
        for (_gt = 0x111E0; _gt <= 70143; _gt++){ _results193.push(_gt); }
        return _results193;
      }).apply(this), "Sinhala Archaic Numbers"
    ], [
      (function() {
        _results194 = [];
        for (_gu = 0x11200; _gu <= 70223; _gu++){ _results194.push(_gu); }
        return _results194;
      }).apply(this), "Khojki"
    ], [
      (function() {
        _results195 = [];
        for (_gv = 0x112B0; _gv <= 70399; _gv++){ _results195.push(_gv); }
        return _results195;
      }).apply(this), "Khudawadi"
    ], [
      (function() {
        _results196 = [];
        for (_gw = 0x11300; _gw <= 70527; _gw++){ _results196.push(_gw); }
        return _results196;
      }).apply(this), "Grantha"
    ], [
      (function() {
        _results197 = [];
        for (_gx = 0x11480; _gx <= 70879; _gx++){ _results197.push(_gx); }
        return _results197;
      }).apply(this), "Tirhuta"
    ], [
      (function() {
        _results198 = [];
        for (_gy = 0x11580; _gy <= 71167; _gy++){ _results198.push(_gy); }
        return _results198;
      }).apply(this), "Siddham"
    ], [
      (function() {
        _results199 = [];
        for (_gz = 0x11600; _gz <= 71263; _gz++){ _results199.push(_gz); }
        return _results199;
      }).apply(this), "Modi"
    ], [
      (function() {
        _results200 = [];
        for (_ha = 0x11680; _ha <= 71375; _ha++){ _results200.push(_ha); }
        return _results200;
      }).apply(this), "Takri"
    ], [
      (function() {
        _results201 = [];
        for (_hb = 0x118A0; _hb <= 71935; _hb++){ _results201.push(_hb); }
        return _results201;
      }).apply(this), "Warang Citi"
    ], [
      (function() {
        _results202 = [];
        for (_hc = 0x11AC0; _hc <= 72447; _hc++){ _results202.push(_hc); }
        return _results202;
      }).apply(this), "Pau Cin Hau"
    ], [
      (function() {
        _results203 = [];
        for (_hd = 0x12000; _hd <= 74751; _hd++){ _results203.push(_hd); }
        return _results203;
      }).apply(this), "Cuneiform"
    ], [
      (function() {
        _results204 = [];
        for (_he = 0x12400; _he <= 74879; _he++){ _results204.push(_he); }
        return _results204;
      }).apply(this), "Cuneiform Numbers and Punctuation"
    ], [
      (function() {
        _results205 = [];
        for (_hf = 0x13000; _hf <= 78895; _hf++){ _results205.push(_hf); }
        return _results205;
      }).apply(this), "Egyptian Hieroglyphs"
    ], [
      (function() {
        _results206 = [];
        for (_hg = 0x16800; _hg <= 92735; _hg++){ _results206.push(_hg); }
        return _results206;
      }).apply(this), "Bamum Supplement"
    ], [
      (function() {
        _results207 = [];
        for (_hh = 0x16A40; _hh <= 92783; _hh++){ _results207.push(_hh); }
        return _results207;
      }).apply(this), "Mro"
    ], [
      (function() {
        _results208 = [];
        for (_hi = 0x16AD0; _hi <= 92927; _hi++){ _results208.push(_hi); }
        return _results208;
      }).apply(this), "Bassa Vah"
    ], [
      (function() {
        _results209 = [];
        for (_hj = 0x16B00; _hj <= 93071; _hj++){ _results209.push(_hj); }
        return _results209;
      }).apply(this), "Pahawh Hmong"
    ], [
      (function() {
        _results210 = [];
        for (_hk = 0x16F00; _hk <= 94111; _hk++){ _results210.push(_hk); }
        return _results210;
      }).apply(this), "Miao"
    ], [
      (function() {
        _results211 = [];
        for (_hl = 0x1B000; _hl <= 110847; _hl++){ _results211.push(_hl); }
        return _results211;
      }).apply(this), "Kana Supplement"
    ], [
      (function() {
        _results212 = [];
        for (_hm = 0x1BC00; _hm <= 113823; _hm++){ _results212.push(_hm); }
        return _results212;
      }).apply(this), "Duployan"
    ], [[113824, 113825, 113826, 113827, 113828, 113829, 113830, 113831, 113832, 113833, 113834, 113835, 113836, 113837, 113838, 113839], "Shorthand Format Controls"], [
      (function() {
        _results213 = [];
        for (_hn = 0x1D000; _hn <= 119039; _hn++){ _results213.push(_hn); }
        return _results213;
      }).apply(this), "Byzantine Musical Symbols"
    ], [
      (function() {
        _results214 = [];
        for (_ho = 0x1D100; _ho <= 119295; _ho++){ _results214.push(_ho); }
        return _results214;
      }).apply(this), "Musical Symbols"
    ], [
      (function() {
        _results215 = [];
        for (_hp = 0x1D200; _hp <= 119375; _hp++){ _results215.push(_hp); }
        return _results215;
      }).apply(this), "Ancient Greek Musical Notation"
    ], [
      (function() {
        _results216 = [];
        for (_hq = 0x1D300; _hq <= 119647; _hq++){ _results216.push(_hq); }
        return _results216;
      }).apply(this), "Tai Xuan Jing Symbols"
    ], [
      (function() {
        _results217 = [];
        for (_hr = 0x1D360; _hr <= 119679; _hr++){ _results217.push(_hr); }
        return _results217;
      }).apply(this), "Counting Rod Numerals"
    ], [
      (function() {
        _results218 = [];
        for (_hs = 0x1D400; _hs <= 120831; _hs++){ _results218.push(_hs); }
        return _results218;
      }).apply(this), "Mathematical Alphanumeric Symbols"
    ], [
      (function() {
        _results219 = [];
        for (_ht = 0x1E800; _ht <= 125151; _ht++){ _results219.push(_ht); }
        return _results219;
      }).apply(this), "Mende Kikakui"
    ], [
      (function() {
        _results220 = [];
        for (_hu = 0x1EE00; _hu <= 126719; _hu++){ _results220.push(_hu); }
        return _results220;
      }).apply(this), "Arabic Mathematical Alphabetic Symbols"
    ], [
      (function() {
        _results221 = [];
        for (_hv = 0x1F000; _hv <= 127023; _hv++){ _results221.push(_hv); }
        return _results221;
      }).apply(this), "Mahjong Tiles"
    ], [
      (function() {
        _results222 = [];
        for (_hw = 0x1F030; _hw <= 127135; _hw++){ _results222.push(_hw); }
        return _results222;
      }).apply(this), "Domino Tiles"
    ], [
      (function() {
        _results223 = [];
        for (_hx = 0x1F0A0; _hx <= 127231; _hx++){ _results223.push(_hx); }
        return _results223;
      }).apply(this), "Playing Cards"
    ], [
      (function() {
        _results224 = [];
        for (_hy = 0x1F100; _hy <= 127487; _hy++){ _results224.push(_hy); }
        return _results224;
      }).apply(this), "Enclosed Alphanumeric Supplement"
    ], [
      (function() {
        _results225 = [];
        for (_hz = 0x1F200; _hz <= 127743; _hz++){ _results225.push(_hz); }
        return _results225;
      }).apply(this), "Enclosed Ideographic Supplement"
    ], [
      (function() {
        _results226 = [];
        for (_ia = 0x1F300; _ia <= 128511; _ia++){ _results226.push(_ia); }
        return _results226;
      }).apply(this), "Miscellaneous Symbols and Pictographs"
    ], [
      (function() {
        _results227 = [];
        for (_ib = 0x1F600; _ib <= 128591; _ib++){ _results227.push(_ib); }
        return _results227;
      }).apply(this), "Emoticons"
    ], [
      (function() {
        _results228 = [];
        for (_ic = 0x1F650; _ic <= 128639; _ic++){ _results228.push(_ic); }
        return _results228;
      }).apply(this), "Ornamental Dingbats"
    ], [
      (function() {
        _results229 = [];
        for (_id = 0x1F680; _id <= 128767; _id++){ _results229.push(_id); }
        return _results229;
      }).apply(this), "Transport and Map Symbols"
    ], [
      (function() {
        _results230 = [];
        for (_ie = 0x1F700; _ie <= 128895; _ie++){ _results230.push(_ie); }
        return _results230;
      }).apply(this), "Alchemical Symbols"
    ], [
      (function() {
        _results231 = [];
        for (_if = 0x1F780; _if <= 129023; _if++){ _results231.push(_if); }
        return _results231;
      }).apply(this), "Geometric Shapes Extended"
    ], [
      (function() {
        _results232 = [];
        for (_ig = 0x1F800; _ig <= 129279; _ig++){ _results232.push(_ig); }
        return _results232;
      }).apply(this), "Supplemental Arrows-C"
    ], [
      (function() {
        _results233 = [];
        for (_ih = 0x1FF80; _ih <= 131071; _ih++){ _results233.push(_ih); }
        return _results233;
      }).apply(this), "Unassigned"
    ], [
      (function() {
        _results234 = [];
        for (_ii = 0x20000; _ii <= 173782; _ii++){ _results234.push(_ii); }
        return _results234;
      }).apply(this), "CJK Unified Ideographs Extension B"
    ], [
      (function() {
        _results235 = [];
        for (_ij = 0x2A700; _ij <= 177972; _ij++){ _results235.push(_ij); }
        return _results235;
      }).apply(this), "CJK Unified Ideographs Extension C"
    ], [
      (function() {
        _results236 = [];
        for (_ik = 0x2B740; _ik <= 178205; _ik++){ _results236.push(_ik); }
        return _results236;
      }).apply(this), "CJK Unified Ideographs Extension D"
    ], [
      (function() {
        _results237 = [];
        for (_il = 0x2F800; _il <= 195103; _il++){ _results237.push(_il); }
        return _results237;
      }).apply(this), "CJK Compatibility Ideographs Supplement"
    ], [
      (function() {
        _results238 = [];
        for (_im = 0x2FF80; _im <= 196607; _im++){ _results238.push(_im); }
        return _results238;
      }).apply(this), "Unassigned"
    ], [
      (function() {
        _results239 = [];
        for (_in = 0x3FF80; _in <= 262143; _in++){ _results239.push(_in); }
        return _results239;
      }).apply(this), "Unassigned"
    ], [
      (function() {
        _results240 = [];
        for (_io = 0x4FF80; _io <= 327679; _io++){ _results240.push(_io); }
        return _results240;
      }).apply(this), "Unassigned"
    ], [
      (function() {
        _results241 = [];
        for (_ip = 0x5FF80; _ip <= 393215; _ip++){ _results241.push(_ip); }
        return _results241;
      }).apply(this), "Unassigned"
    ], [
      (function() {
        _results242 = [];
        for (_iq = 0x6FF80; _iq <= 458751; _iq++){ _results242.push(_iq); }
        return _results242;
      }).apply(this), "Unassigned"
    ], [
      (function() {
        _results243 = [];
        for (_ir = 0x7FF80; _ir <= 524287; _ir++){ _results243.push(_ir); }
        return _results243;
      }).apply(this), "Unassigned"
    ], [
      (function() {
        _results244 = [];
        for (_is = 0x8FF80; _is <= 589823; _is++){ _results244.push(_is); }
        return _results244;
      }).apply(this), "Unassigned"
    ], [
      (function() {
        _results245 = [];
        for (_it = 0x9FF80; _it <= 655359; _it++){ _results245.push(_it); }
        return _results245;
      }).apply(this), "Unassigned"
    ], [
      (function() {
        _results246 = [];
        for (_iu = 0xAFF80; _iu <= 720895; _iu++){ _results246.push(_iu); }
        return _results246;
      }).apply(this), "Unassigned"
    ], [
      (function() {
        _results247 = [];
        for (_iv = 0xBFF80; _iv <= 786431; _iv++){ _results247.push(_iv); }
        return _results247;
      }).apply(this), "Unassigned"
    ], [
      (function() {
        _results248 = [];
        for (_iw = 0xCFF80; _iw <= 851967; _iw++){ _results248.push(_iw); }
        return _results248;
      }).apply(this), "Unassigned"
    ], [
      (function() {
        _results249 = [];
        for (_ix = 0xDFF80; _ix <= 917503; _ix++){ _results249.push(_ix); }
        return _results249;
      }).apply(this), "Unassigned"
    ], [
      (function() {
        _results250 = [];
        for (_iy = 0xE0000; _iy <= 917631; _iy++){ _results250.push(_iy); }
        return _results250;
      }).apply(this), "Tags"
    ], [
      (function() {
        _results251 = [];
        for (_iz = 0xE0100; _iz <= 917999; _iz++){ _results251.push(_iz); }
        return _results251;
      }).apply(this), "Variation Selectors Supplement"
    ], [
      (function() {
        _results252 = [];
        for (_ja = 0xEFF80; _ja <= 983039; _ja++){ _results252.push(_ja); }
        return _results252;
      }).apply(this), "Unassigned"
    ], [
      (function() {
        _results253 = [];
        for (_jb = 0xFFF80; _jb <= 1048575; _jb++){ _results253.push(_jb); }
        return _results253;
      }).apply(this), "Supplementary Private Use Area-A"
    ], [
      (function() {
        _results254 = [];
        for (_jc = 0x10FF80; _jc <= 1114111; _jc++){ _results254.push(_jc); }
        return _results254;
      }).apply(this), "Supplementary Private Use Area-B"
    ]
  ];

}).call(this);

//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAiZmlsZSI6ICIiLAogICJzb3VyY2VSb290IjogIiIsCiAgInNvdXJjZXMiOiBbCiAgICAiL1VzZXJzL2lnYXdhdGFpaWNoaS8uYXRvbS9wYWNrYWdlcy9qYXBhbmVzZS13cmFwL2xpYi91bmljb2RlLmNvZmZlZSIKICBdLAogICJuYW1lcyI6IFtdLAogICJtYXBwaW5ncyI6ICJBQUVBO0FBQUEsTUFBQSwyMklBQUE7O0FBQUEsRUFBQSxNQUFNLENBQUMsT0FBUCxHQUNBO0lBQ0U7TUFBQzs7OztvQkFBRCxFQUFtQiw2QkFBbkI7S0FERixFQUVFO01BQUM7Ozs7b0JBQUQsRUFBbUIsb0NBQW5CO0tBRkYsRUFHRTtNQUFDOzs7O29CQUFELEVBQW1CLGtCQUFuQjtLQUhGLEVBSUU7TUFBQzs7OztvQkFBRCxFQUFtQixrQkFBbkI7S0FKRixFQUtFO01BQUM7Ozs7b0JBQUQsRUFBbUIsZ0JBQW5CO0tBTEYsRUFNRTtNQUFDOzs7O29CQUFELEVBQW1CLDBCQUFuQjtLQU5GLEVBT0U7TUFBQzs7OztvQkFBRCxFQUFtQiw2QkFBbkI7S0FQRixFQVFFO01BQUM7Ozs7b0JBQUQsRUFBbUIsa0JBQW5CO0tBUkYsRUFTRTtNQUFDOzs7O29CQUFELEVBQW1CLFVBQW5CO0tBVEYsRUFVRTtNQUFDOzs7O29CQUFELEVBQW1CLHFCQUFuQjtLQVZGLEVBV0U7TUFBQzs7OztvQkFBRCxFQUFtQixVQUFuQjtLQVhGLEVBWUU7TUFBQzs7OztvQkFBRCxFQUFtQixRQUFuQjtLQVpGLEVBYUU7TUFBQzs7OztvQkFBRCxFQUFtQixRQUFuQjtLQWJGLEVBY0U7TUFBQzs7OztvQkFBRCxFQUFtQixRQUFuQjtLQWRGLEVBZUU7TUFBQzs7OztvQkFBRCxFQUFtQixtQkFBbkI7S0FmRixFQWdCRTtNQUFDOzs7O29CQUFELEVBQW1CLFFBQW5CO0tBaEJGLEVBaUJFO01BQUM7Ozs7b0JBQUQsRUFBbUIsS0FBbkI7S0FqQkYsRUFrQkU7TUFBQzs7OztvQkFBRCxFQUFtQixXQUFuQjtLQWxCRixFQW1CRTtN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

//# sourceURL=/Users/igawataiichi/.atom/packages/japanese-wrap/lib/unicode.coffee
