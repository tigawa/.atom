(function() {
  var cmykToRGB, hcgToRGB, hexARGBToRGB, hexRGBAToRGB, hexToRGB, hslToRGB, hsvToHWB, hsvToRGB, hwbToHSV, hwbToRGB, rgbToCMYK, rgbToHCG, rgbToHSL, rgbToHSV, rgbToHWB, rgbToHex, rgbToHexARGB, rgbToHexRGBA;

  rgbToHex = function(r, g, b) {
    var rnd, value;
    rnd = Math.round;
    value = ((rnd(r) << 16) + (rnd(g) << 8) + rnd(b)).toString(16);
    while (value.length < 6) {
      value = "0" + value;
    }
    return value;
  };

  hexToRGB = function(hex) {
    var b, color, g, r;
    color = parseInt(hex, 16);
    r = (color >> 16) & 0xff;
    g = (color >> 8) & 0xff;
    b = color & 0xff;
    return [r, g, b];
  };

  rgbToHexARGB = function(r, g, b, a) {
    var rnd, value;
    rnd = Math.round;
    value = ((rnd(a * 255) << 24) + (rnd(r) << 16) + (rnd(g) << 8) + rnd(b)).toString(16);
    while (value.length < 8) {
      value = "0" + value;
    }
    return value;
  };

  rgbToHexRGBA = function(r, g, b, a) {
    var rnd, value;
    rnd = Math.round;
    value = ((rnd(r) << 24) + (rnd(g) << 16) + (rnd(b) << 8) + rnd(a * 255)).toString(16);
    while (value.length < 8) {
      value = "0" + value;
    }
    return value;
  };

  hexARGBToRGB = function(hex) {
    var a, b, color, g, r;
    color = parseInt(hex, 16);
    a = ((color >> 24) & 0xff) / 255;
    r = (color >> 16) & 0xff;
    g = (color >> 8) & 0xff;
    b = color & 0xff;
    return [r, g, b, a];
  };

  hexRGBAToRGB = function(hex) {
    var a, b, color, g, r;
    color = parseInt(hex, 16);
    r = (color >> 24) & 0xff;
    g = (color >> 16) & 0xff;
    b = (color >> 8) & 0xff;
    a = (color & 0xff) / 255;
    return [r, g, b, a];
  };

  rgbToHSV = function(r, g, b) {
    var delta, deltaB, deltaG, deltaR, h, maxVal, minVal, rnd, s, v;
    r = r / 255;
    g = g / 255;
    b = b / 255;
    rnd = Math.round;
    minVal = Math.min(r, g, b);
    maxVal = Math.max(r, g, b);
    delta = maxVal - minVal;
    v = maxVal;
    if (delta === 0) {
      h = 0;
      s = 0;
    } else {
      s = delta / v;
      deltaR = (((v - r) / 6) + (delta / 2)) / delta;
      deltaG = (((v - g) / 6) + (delta / 2)) / delta;
      deltaB = (((v - b) / 6) + (delta / 2)) / delta;
      if (r === v) {
        h = deltaB - deltaG;
      } else if (g === v) {
        h = (1 / 3) + deltaR - deltaB;
      } else if (b === v) {
        h = (2 / 3) + deltaG - deltaR;
      }
      if (h < 0) {
        h += 1;
      }
      if (h > 1) {
        h -= 1;
      }
    }
    return [h * 360, s * 100, v * 100];
  };

  hsvToRGB = function(h, s, v) {
    var b, comp1, comp2, comp3, dominant, g, r, ref, ref1, ref2, ref3, ref4, ref5, rnd;
    h = h / 60;
    s = s / 100;
    v = v / 100;
    rnd = Math.round;
    if (s === 0) {
      return [rnd(v * 255), rnd(v * 255), rnd(v * 255)];
    } else {
      dominant = Math.floor(h);
      comp1 = v * (1 - s);
      comp2 = v * (1 - s * (h - dominant));
      comp3 = v * (1 - s * (1 - (h - dominant)));
      switch (dominant) {
        case 0:
          ref = [v, comp3, comp1], r = ref[0], g = ref[1], b = ref[2];
          break;
        case 1:
          ref1 = [comp2, v, comp1], r = ref1[0], g = ref1[1], b = ref1[2];
          break;
        case 2:
          ref2 = [comp1, v, comp3], r = ref2[0], g = ref2[1], b = ref2[2];
          break;
        case 3:
          ref3 = [comp1, comp2, v], r = ref3[0], g = ref3[1], b = ref3[2];
          break;
        case 4:
          ref4 = [comp3, comp1, v], r = ref4[0], g = ref4[1], b = ref4[2];
          break;
        default:
          ref5 = [v, comp1, comp2], r = ref5[0], g = ref5[1], b = ref5[2];
      }
      return [r * 255, g * 255, b * 255];
    }
  };

  rgbToHSL = function(r, g, b) {
    var d, h, l, max, min, ref, s;
    ref = [r / 255, g / 255, b / 255], r = ref[0], g = ref[1], b = ref[2];
    max = Math.max(r, g, b);
    min = Math.min(r, g, b);
    h = void 0;
    s = void 0;
    l = (max + min) / 2;
    d = max - min;
    if (max === min) {
      h = s = 0;
    } else {
      s = (l > 0.5 ? d / (2 - max - min) : d / (max + min));
      switch (max) {
        case r:
          h = (g - b) / d + (g < b ? 6 : 0);
          break;
        case g:
          h = (b - r) / d + 2;
          break;
        case b:
          h = (r - g) / d + 4;
      }
      h /= 6;
    }
    return [h * 360, s * 100, l * 100];
  };

  hslToRGB = function(h, s, l) {
    var clamp, hue, m1, m2;
    clamp = function(val) {
      return Math.min(1, Math.max(0, val));
    };
    hue = function(h) {
      h = (h < 0 ? h + 1 : (h > 1 ? h - 1 : h));
      if (h * 6 < 1) {
        return m1 + (m2 - m1) * h * 6;
      } else if (h * 2 < 1) {
        return m2;
      } else if (h * 3 < 2) {
        return m1 + (m2 - m1) * (2 / 3 - h) * 6;
      } else {
        return m1;
      }
    };
    h = (h % 360) / 360;
    s = clamp(s / 100);
    l = clamp(l / 100);
    m2 = (l <= 0.5 ? l * (s + 1) : l + s - l * s);
    m1 = l * 2 - m2;
    return [hue(h + 1 / 3) * 255, hue(h) * 255, hue(h - 1 / 3) * 255];
  };

  rgbToHCG = function(r, g, b) {
    var c, gr, h, max, min, ref;
    r = r / 255;
    g = g / 255;
    b = b / 255;
    max = Math.max(r, g, b);
    min = Math.min(r, g, b);
    c = max - min;
    gr = 0;
    h = 0;
    if (c < 1) {
      gr = min / (1 - c);
    }
    if (c > 0) {
      switch (max) {
        case r:
          h = (g - b) / c + ((ref = g < b) != null ? ref : {
            6: 0
          });
          break;
        case g:
          h = (b - r) / c + 2;
          break;
        case b:
          h = (r - g) / c + 4;
      }
      h /= 6;
    }
    return [h * 360, c * 100, gr * 100];
  };

  hcgToRGB = function(h, c, gr) {
    var b, f, g, i, m, mod, q, r, t;
    h = h / 360 * 6;
    c = c / 100;
    gr = gr / 100;
    if (c <= 0) {
      return [gr * 255, gr * 255, gr * 255];
    }
    i = Math.floor(h);
    f = h - i;
    q = c * (1 - f);
    t = c * f;
    mod = i % 6;
    r = [c, q, 0, 0, t, c][mod];
    g = [t, c, c, q, 0, 0][mod];
    b = [0, 0, t, c, c, q][mod];
    m = (1 - c) * gr;
    return [(r + m) * 255, (g + m) * 255, (b + m) * 255];
  };

  hsvToHWB = function(h, s, v) {
    var b, ref, w;
    ref = [s / 100, v / 100], s = ref[0], v = ref[1];
    w = (1 - s) * v;
    b = 1 - v;
    return [h, w * 100, b * 100];
  };

  hwbToHSV = function(h, w, b) {
    var ref, s, v;
    ref = [w / 100, b / 100], w = ref[0], b = ref[1];
    s = 1 - (w / (1 - b));
    v = 1 - b;
    return [h, s * 100, v * 100];
  };

  rgbToHWB = function(r, g, b) {
    return hsvToHWB.apply(null, rgbToHSV(r, g, b));
  };

  hwbToRGB = function(h, w, b) {
    return hsvToRGB.apply(null, hwbToHSV(h, w, b));
  };

  cmykToRGB = function(c, m, y, k) {
    var b, g, r;
    r = 1 - Math.min(1, c * (1 - k) + k);
    g = 1 - Math.min(1, m * (1 - k) + k);
    b = 1 - Math.min(1, y * (1 - k) + k);
    r = Math.floor(r * 255);
    g = Math.floor(g * 255);
    b = Math.floor(b * 255);
    return [r, g, b];
  };

  rgbToCMYK = function(r, g, b) {
    var computedC, computedK, computedM, computedY, minCMY;
    if (r === 0 && g === 0 && b === 0) {
      return [0, 0, 0, 1];
    }
    computedC = 1 - (r / 255);
    computedM = 1 - (g / 255);
    computedY = 1 - (b / 255);
    minCMY = Math.min(computedC, Math.min(computedM, computedY));
    computedC = (computedC - minCMY) / (1 - minCMY);
    computedM = (computedM - minCMY) / (1 - minCMY);
    computedY = (computedY - minCMY) / (1 - minCMY);
    computedK = minCMY;
    return [computedC, computedM, computedY, computedK];
  };

  module.exports = {
    cmykToRGB: cmykToRGB,
    hexARGBToRGB: hexARGBToRGB,
    hexRGBAToRGB: hexRGBAToRGB,
    hexToRGB: hexToRGB,
    hslToRGB: hslToRGB,
    hsvToHWB: hsvToHWB,
    hsvToRGB: hsvToRGB,
    hcgToRGB: hcgToRGB,
    hwbToHSV: hwbToHSV,
    hwbToRGB: hwbToRGB,
    rgbToCMYK: rgbToCMYK,
    rgbToHex: rgbToHex,
    rgbToHexARGB: rgbToHexARGB,
    rgbToHexRGBA: rgbToHexRGBA,
    rgbToHSL: rgbToHSL,
    rgbToHSV: rgbToHSV,
    rgbToHWB: rgbToHWB,
    rgbToHCG: rgbToHCG
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL1VzZXJzL2lnYXdhdGFpaWNoaS8uYXRvbS9wYWNrYWdlcy9waWdtZW50cy9saWIvY29sb3ItY29udmVyc2lvbnMuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQVFBO0FBQUEsTUFBQTs7RUFBQSxRQUFBLEdBQVksU0FBQyxDQUFELEVBQUksQ0FBSixFQUFPLENBQVA7QUFDVixRQUFBO0lBQUEsR0FBQSxHQUFNLElBQUksQ0FBQztJQUNYLEtBQUEsR0FBUSxDQUFDLENBQUMsR0FBQSxDQUFJLENBQUosQ0FBQSxJQUFVLEVBQVgsQ0FBQSxHQUFpQixDQUFDLEdBQUEsQ0FBSSxDQUFKLENBQUEsSUFBVSxDQUFYLENBQWpCLEdBQWlDLEdBQUEsQ0FBSSxDQUFKLENBQWxDLENBQXlDLENBQUMsUUFBMUMsQ0FBbUQsRUFBbkQ7QUFHWSxXQUFNLEtBQUssQ0FBQyxNQUFOLEdBQWUsQ0FBckI7TUFBcEIsS0FBQSxHQUFRLEdBQUEsR0FBSTtJQUFRO1dBRXBCO0VBUFU7O0VBZ0JaLFFBQUEsR0FBVyxTQUFDLEdBQUQ7QUFDVCxRQUFBO0lBQUEsS0FBQSxHQUFRLFFBQUEsQ0FBUyxHQUFULEVBQWMsRUFBZDtJQUVSLENBQUEsR0FBSSxDQUFDLEtBQUEsSUFBUyxFQUFWLENBQUEsR0FBZ0I7SUFDcEIsQ0FBQSxHQUFJLENBQUMsS0FBQSxJQUFTLENBQVYsQ0FBQSxHQUFlO0lBQ25CLENBQUEsR0FBSSxLQUFBLEdBQVE7V0FFWixDQUFDLENBQUQsRUFBSSxDQUFKLEVBQU8sQ0FBUDtFQVBTOztFQWtCWCxZQUFBLEdBQWUsU0FBQyxDQUFELEVBQUksQ0FBSixFQUFPLENBQVAsRUFBVSxDQUFWO0FBQ2IsUUFBQTtJQUFBLEdBQUEsR0FBTSxJQUFJLENBQUM7SUFDWCxLQUFBLEdBQVEsQ0FDTixDQUFDLEdBQUEsQ0FBSSxDQUFBLEdBQUksR0FBUixDQUFBLElBQWdCLEVBQWpCLENBQUEsR0FDQSxDQUFDLEdBQUEsQ0FBSSxDQUFKLENBQUEsSUFBVSxFQUFYLENBREEsR0FFQSxDQUFDLEdBQUEsQ0FBSSxDQUFKLENBQUEsSUFBVSxDQUFYLENBRkEsR0FHQSxHQUFBLENBQUksQ0FBSixDQUpNLENBS1AsQ0FBQyxRQUxNLENBS0csRUFMSDtBQVFZLFdBQU0sS0FBSyxDQUFDLE1BQU4sR0FBZSxDQUFyQjtNQUFwQixLQUFBLEdBQVEsR0FBQSxHQUFJO0lBQVE7V0FFcEI7RUFaYTs7RUF1QmYsWUFBQSxHQUFlLFNBQUMsQ0FBRCxFQUFJLENBQUosRUFBTyxDQUFQLEVBQVUsQ0FBVjtBQUNiLFFBQUE7SUFBQSxHQUFBLEdBQU0sSUFBSSxDQUFDO0lBQ1gsS0FBQSxHQUFRLENBQ04sQ0FBQyxHQUFBLENBQUksQ0FBSixDQUFBLElBQVUsRUFBWCxDQUFBLEdBQ0EsQ0FBQyxHQUFBLENBQUksQ0FBSixDQUFBLElBQVUsRUFBWCxDQURBLEdBRUEsQ0FBQyxHQUFBLENBQUksQ0FBSixDQUFBLElBQVUsQ0FBWCxDQUZBLEdBR0EsR0FBQSxDQUFJLENBQUEsR0FBSSxHQUFSLENBSk0sQ0FLUCxDQUFDLFFBTE0sQ0FLRyxFQUxIO0FBUVksV0FBTSxLQUFLLENBQUMsTUFBTixHQUFlLENBQXJCO01BQXBCLEtBQUEsR0FBUSxHQUFBLEdBQUk7SUFBUTtXQUVwQjtFQVphOztFQXFCZixZQUFBLEdBQWUsU0FBQyxHQUFEO0FBQ2IsUUFBQTtJQUFBLEtBQUEsR0FBUSxRQUFBLENBQVMsR0FBVCxFQUFjLEVBQWQ7SUFFUixDQUFBLEdBQUksQ0FBQyxDQUFDLEtBQUEsSUFBUyxFQUFWLENBQUEsR0FBZ0IsSUFBakIsQ0FBQSxHQUF5QjtJQUM3QixDQUFBLEdBQUksQ0FBQyxLQUFBLElBQVMsRUFBVixDQUFBLEdBQWdCO0lBQ3BCLENBQUEsR0FBSSxDQUFDLEtBQUEsSUFBUyxDQUFWLENBQUEsR0FBZTtJQUNuQixDQUFBLEdBQUksS0FBQSxHQUFRO1dBRVosQ0FBQyxDQUFELEVBQUksQ0FBSixFQUFPLENBQVAsRUFBVSxDQUFWO0VBUmE7O0VBa0JmLFlBQUEsR0FBZSxTQUFDLEdBQUQ7QUFDYixRQUFBO0lBQUEsS0FBQSxHQUFRLFFBQUEsQ0FBUyxHQUFULEVBQWMsRUFBZDtJQUVSLENBQUEsR0FBSyxDQUFDLEtBQUEsSUFBUyxFQUFWLENBQUEsR0FBZ0I7SUFDckIsQ0FBQSxHQUFJLENBQUMsS0FBQSxJQUFTLEVBQVYsQ0FBQSxHQUFnQjtJQUNwQixDQUFBLEdBQUksQ0FBQyxLQUFBLElBQVMsQ0FBVixDQUFBLEdBQWU7SUFDbkIsQ0FBQSxHQUFJLENBQUMsS0FBQSxHQUFRLElBQVQsQ0FBQSxHQUFpQjtXQUVyQixDQUFDLENBQUQsRUFBSSxDQUFKLEVBQU8sQ0FBUCxFQUFVLENBQVY7RUFSYTs7RUFrQmYsUUFBQSxHQUFXLFNBQUMsQ0FBRCxFQUFJLENBQUosRUFBTyxDQUFQO0FBRVQsUUFBQTtJQUFBLENBQUEsR0FBSSxDQUFBLEdBQUk7SUFDUixDQUFBLEdBQUksQ0FBQSxHQUFJO0lBQ1IsQ0FBQSxHQUFJLENBQUEsR0FBSTtJQUNSLEdBQUEsR0FBTSxJQUFJLENBQUM7SUFFWCxNQUFBLEdBQVMsSUFBSSxDQUFDLEdBQUwsQ0FBUyxDQUFULEVBQVksQ0FBWixFQUFlLENBQWY7SUFDVCxNQUFBLEdBQVMsSUFBSSxDQUFDLEdBQUwsQ0FBUyxDQUFULEVBQVksQ0FBWixFQUFlLENBQWY7SUFDVCxLQUFBLEdBQVEsTUFBQSxHQUFTO0lBR2pCLENBQUEsR0FBSTtJQUlKLElBQUcsS0FBQSxLQUFTLENBQVo7TUFDRSxDQUFBLEdBQUk7TUFDSixDQUFBLEdBQUksRUFGTjtLQUFBLE1BQUE7TUFNRSxDQUFBLEdBQUksS0FBQSxHQUFRO01BQ1osTUFBQSxHQUFTLENBQUMsQ0FBQyxDQUFDLENBQUEsR0FBSSxDQUFMLENBQUEsR0FBVSxDQUFYLENBQUEsR0FBZ0IsQ0FBQyxLQUFBLEdBQVEsQ0FBVCxDQUFqQixDQUFBLEdBQWdDO01BQ3pDLE1BQUEsR0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFBLEdBQUksQ0FBTCxDQUFBLEdBQVUsQ0FBWCxDQUFBLEdBQWdCLENBQUMsS0FBQSxHQUFRLENBQVQsQ0FBakIsQ0FBQSxHQUFnQztNQUN6QyxNQUFBLEdBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQSxHQUFJLENBQUwsQ0FBQSxHQUFVLENBQVgsQ0FBQSxHQUFnQixDQUFDLEtBQUEsR0FBUSxDQUFULENBQWpCLENBQUEsR0FBZ0M7TUFRekMsSUFBRyxDQUFBLEtBQUssQ0FBUjtRQUFvQixDQUFBLEdBQUksTUFBQSxHQUFTLE9BQWpDO09BQUEsTUFDSyxJQUFHLENBQUEsS0FBSyxDQUFSO1FBQWUsQ0FBQSxHQUFJLENBQUMsQ0FBQSxHQUFJLENBQUwsQ0FBQSxHQUFVLE1BQVYsR0FBbUIsT0FBdEM7T0FBQSxNQUNBLElBQUcsQ0FBQSxLQUFLLENBQVI7UUFBZSxDQUFBLEdBQUksQ0FBQyxDQUFBLEdBQUksQ0FBTCxDQUFBLEdBQVUsTUFBVixHQUFtQixPQUF0Qzs7TUFHTCxJQUFVLENBQUEsR0FBSSxDQUFkO1FBQUEsQ0FBQSxJQUFLLEVBQUw7O01BQ0EsSUFBVSxDQUFBLEdBQUksQ0FBZDtRQUFBLENBQUEsSUFBSyxFQUFMO09BdkJGOztXQTJCQSxDQUFDLENBQUEsR0FBSSxHQUFMLEVBQVUsQ0FBQSxHQUFJLEdBQWQsRUFBbUIsQ0FBQSxHQUFJLEdBQXZCO0VBM0NTOztFQXNEWCxRQUFBLEdBQVcsU0FBQyxDQUFELEVBQUksQ0FBSixFQUFPLENBQVA7QUFHVCxRQUFBO0lBQUEsQ0FBQSxHQUFJLENBQUEsR0FBSTtJQUNSLENBQUEsR0FBSSxDQUFBLEdBQUk7SUFDUixDQUFBLEdBQUksQ0FBQSxHQUFJO0lBQ1IsR0FBQSxHQUFNLElBQUksQ0FBQztJQUlYLElBQUcsQ0FBQSxLQUFLLENBQVI7QUFDRSxhQUFPLENBQUMsR0FBQSxDQUFJLENBQUEsR0FBSSxHQUFSLENBQUQsRUFBZSxHQUFBLENBQUksQ0FBQSxHQUFJLEdBQVIsQ0FBZixFQUE2QixHQUFBLENBQUksQ0FBQSxHQUFJLEdBQVIsQ0FBN0IsRUFEVDtLQUFBLE1BQUE7TUFZRSxRQUFBLEdBQVcsSUFBSSxDQUFDLEtBQUwsQ0FBVyxDQUFYO01BRVgsS0FBQSxHQUFRLENBQUEsR0FBSSxDQUFDLENBQUEsR0FBSSxDQUFMO01BQ1osS0FBQSxHQUFRLENBQUEsR0FBSSxDQUFDLENBQUEsR0FBSSxDQUFBLEdBQUksQ0FBQyxDQUFBLEdBQUksUUFBTCxDQUFUO01BQ1osS0FBQSxHQUFRLENBQUEsR0FBSSxDQUFDLENBQUEsR0FBSSxDQUFBLEdBQUksQ0FBQyxDQUFBLEdBQUksQ0FBQyxDQUFBLEdBQUksUUFBTCxDQUFMLENBQVQ7QUFJWixjQUFPLFFBQVA7QUFBQSxhQUNPLENBRFA7VUFDYyxNQUFZLENBQUMsQ0FBRCxFQUFJLEtBQUosRUFBVyxLQUFYLENBQVosRUFBQyxVQUFELEVBQUksVUFBSixFQUFPO0FBQWQ7QUFEUCxhQUVPLENBRlA7VUFFYyxPQUFZLENBQUMsS0FBRCxFQUFRLENBQVIsRUFBVyxLQUFYLENBQVosRUFBQyxXQUFELEVBQUksV0FBSixFQUFPO0FBQWQ7QUFGUCxhQUdPLENBSFA7VUFHYyxPQUFZLENBQUMsS0FBRCxFQUFRLENBQVIsRUFBVyxLQUFYLENBQVosRUFBQyxXQUFELEVBQUksV0FBSixFQUFPO0FBQWQ7QUFIUCxhQUlPLENBSlA7VUFJYyxPQUFZLENBQUMsS0FBRCxFQUFRLEtBQVIsRUFBZSxDQUFmLENBQVosRUFBQyxXQUFELEVBQUksV0FBSixFQUFPO0FBQWQ7QUFKUCxhQUtPLENBTFA7VUFLYyxPQUFZLENBQUMsS0FBRCxFQUFRLEtBQVIsRUFBZSxDQUFmLENBQVosRUFBQyxXQUFELEVBQUksV0FBSixFQUFPO0FBQWQ7QUFMUDtVQU1jLE9BQVksQ0FBQyxDQUFELEVBQUksS0FBSixFQUFXLEtBQVgsQ0FBWixFQUFDLFdBQUQsRUFBSSxXQUFKLEVBQU87QUFOckI7QUFVQSxhQUFPLENBQUMsQ0FBQSxHQUFJLEdBQUwsRUFBVSxDQUFBLEdBQUksR0FBZCxFQUFtQixDQUFBLEdBQUksR0FBdkIsRUE5QlQ7O0VBVlM7O0VBa0RYLFFBQUEsR0FBVyxTQUFDLENBQUQsRUFBSSxDQUFKLEVBQU8sQ0FBUDtBQUNULFFBQUE7SUFBQSxNQUFVLENBQ1IsQ0FBQSxHQUFJLEdBREksRUFFUixDQUFBLEdBQUksR0FGSSxFQUdSLENBQUEsR0FBSSxHQUhJLENBQVYsRUFBQyxVQUFELEVBQUcsVUFBSCxFQUFLO0lBS0wsR0FBQSxHQUFNLElBQUksQ0FBQyxHQUFMLENBQVMsQ0FBVCxFQUFZLENBQVosRUFBZSxDQUFmO0lBQ04sR0FBQSxHQUFNLElBQUksQ0FBQyxHQUFMLENBQVMsQ0FBVCxFQUFZLENBQVosRUFBZSxDQUFmO0lBQ04sQ0FBQSxHQUFJO0lBQ0osQ0FBQSxHQUFJO0lBQ0osQ0FBQSxHQUFJLENBQUMsR0FBQSxHQUFNLEdBQVAsQ0FBQSxHQUFjO0lBQ2xCLENBQUEsR0FBSSxHQUFBLEdBQU07SUFDVixJQUFHLEdBQUEsS0FBTyxHQUFWO01BQ0UsQ0FBQSxHQUFJLENBQUEsR0FBSSxFQURWO0tBQUEsTUFBQTtNQUdFLENBQUEsR0FBSSxDQUFJLENBQUEsR0FBSSxHQUFQLEdBQWdCLENBQUEsR0FBSSxDQUFDLENBQUEsR0FBSSxHQUFKLEdBQVUsR0FBWCxDQUFwQixHQUF5QyxDQUFBLEdBQUksQ0FBQyxHQUFBLEdBQU0sR0FBUCxDQUE5QztBQUNKLGNBQU8sR0FBUDtBQUFBLGFBQ08sQ0FEUDtVQUVJLENBQUEsR0FBSSxDQUFDLENBQUEsR0FBSSxDQUFMLENBQUEsR0FBVSxDQUFWLEdBQWUsQ0FBSSxDQUFBLEdBQUksQ0FBUCxHQUFjLENBQWQsR0FBcUIsQ0FBdEI7QUFEaEI7QUFEUCxhQUdPLENBSFA7VUFJSSxDQUFBLEdBQUksQ0FBQyxDQUFBLEdBQUksQ0FBTCxDQUFBLEdBQVUsQ0FBVixHQUFjO0FBRGY7QUFIUCxhQUtPLENBTFA7VUFNSSxDQUFBLEdBQUksQ0FBQyxDQUFBLEdBQUksQ0FBTCxDQUFBLEdBQVUsQ0FBVixHQUFjO0FBTnRCO01BT0EsQ0FBQSxJQUFLLEVBWFA7O1dBYUEsQ0FBQyxDQUFBLEdBQUksR0FBTCxFQUFVLENBQUEsR0FBSSxHQUFkLEVBQW1CLENBQUEsR0FBSSxHQUF2QjtFQXpCUzs7RUFvQ1gsUUFBQSxHQUFXLFNBQUMsQ0FBRCxFQUFJLENBQUosRUFBTyxDQUFQO0FBQ1QsUUFBQTtJQUFBLEtBQUEsR0FBUSxTQUFDLEdBQUQ7YUFBUyxJQUFJLENBQUMsR0FBTCxDQUFTLENBQVQsRUFBWSxJQUFJLENBQUMsR0FBTCxDQUFTLENBQVQsRUFBWSxHQUFaLENBQVo7SUFBVDtJQUVSLEdBQUEsR0FBTSxTQUFDLENBQUQ7TUFDSixDQUFBLEdBQUksQ0FBSSxDQUFBLEdBQUksQ0FBUCxHQUFjLENBQUEsR0FBSSxDQUFsQixHQUEwQixDQUFJLENBQUEsR0FBSSxDQUFQLEdBQWMsQ0FBQSxHQUFJLENBQWxCLEdBQXlCLENBQTFCLENBQTNCO01BQ0osSUFBRyxDQUFBLEdBQUksQ0FBSixHQUFRLENBQVg7ZUFDRSxFQUFBLEdBQUssQ0FBQyxFQUFBLEdBQUssRUFBTixDQUFBLEdBQVksQ0FBWixHQUFnQixFQUR2QjtPQUFBLE1BRUssSUFBRyxDQUFBLEdBQUksQ0FBSixHQUFRLENBQVg7ZUFDSCxHQURHO09BQUEsTUFFQSxJQUFHLENBQUEsR0FBSSxDQUFKLEdBQVEsQ0FBWDtlQUNILEVBQUEsR0FBSyxDQUFDLEVBQUEsR0FBSyxFQUFOLENBQUEsR0FBWSxDQUFDLENBQUEsR0FBSSxDQUFKLEdBQVEsQ0FBVCxDQUFaLEdBQTBCLEVBRDVCO09BQUEsTUFBQTtlQUdILEdBSEc7O0lBTkQ7SUFXTixDQUFBLEdBQUksQ0FBQyxDQUFBLEdBQUksR0FBTCxDQUFBLEdBQVk7SUFDaEIsQ0FBQSxHQUFJLEtBQUEsQ0FBTSxDQUFBLEdBQUksR0FBVjtJQUNKLENBQUEsR0FBSSxLQUFBLENBQU0sQ0FBQSxHQUFJLEdBQVY7SUFDSixFQUFBLEdBQUssQ0FBSSxDQUFBLElBQUssR0FBUixHQUFpQixDQUFBLEdBQUksQ0FBQyxDQUFBLEdBQUksQ0FBTCxDQUFyQixHQUFrQyxDQUFBLEdBQUksQ0FBSixHQUFRLENBQUEsR0FBSSxDQUEvQztJQUNMLEVBQUEsR0FBSyxDQUFBLEdBQUksQ0FBSixHQUFRO0FBRWIsV0FBTyxDQUNMLEdBQUEsQ0FBSSxDQUFBLEdBQUksQ0FBQSxHQUFJLENBQVosQ0FBQSxHQUFpQixHQURaLEVBRUwsR0FBQSxDQUFJLENBQUosQ0FBQSxHQUFTLEdBRkosRUFHTCxHQUFBLENBQUksQ0FBQSxHQUFJLENBQUEsR0FBSSxDQUFaLENBQUEsR0FBaUIsR0FIWjtFQXBCRTs7RUFrQ1gsUUFBQSxHQUFXLFNBQUMsQ0FBRCxFQUFJLENBQUosRUFBTyxDQUFQO0FBQ1QsUUFBQTtJQUFBLENBQUEsR0FBSSxDQUFBLEdBQUk7SUFDUixDQUFBLEdBQUksQ0FBQSxHQUFJO0lBQ1IsQ0FBQSxHQUFJLENBQUEsR0FBSTtJQUNSLEdBQUEsR0FBTSxJQUFJLENBQUMsR0FBTCxDQUFTLENBQVQsRUFBWSxDQUFaLEVBQWUsQ0FBZjtJQUNOLEdBQUEsR0FBTSxJQUFJLENBQUMsR0FBTCxDQUFTLENBQVQsRUFBWSxDQUFaLEVBQWUsQ0FBZjtJQUNOLENBQUEsR0FBSyxHQUFBLEdBQU07SUFDWCxFQUFBLEdBQUs7SUFDTCxDQUFBLEdBQUk7SUFFSixJQUFJLENBQUEsR0FBSSxDQUFSO01BQ0UsRUFBQSxHQUFLLEdBQUEsR0FBTSxDQUFDLENBQUEsR0FBSSxDQUFMLEVBRGI7O0lBR0EsSUFBSSxDQUFBLEdBQUksQ0FBUjtBQUNFLGNBQVEsR0FBUjtBQUFBLGFBQ08sQ0FEUDtVQUVJLENBQUEsR0FBSSxDQUFDLENBQUEsR0FBSSxDQUFMLENBQUEsR0FBVSxDQUFWLEdBQWMsK0JBQVM7WUFBQSxDQUFBLEVBQUksQ0FBSjtXQUFUO0FBRGY7QUFEUCxhQUdPLENBSFA7VUFJSSxDQUFBLEdBQUksQ0FBQyxDQUFBLEdBQUksQ0FBTCxDQUFBLEdBQVUsQ0FBVixHQUFjO0FBRGY7QUFIUCxhQUtPLENBTFA7VUFNSSxDQUFBLEdBQUksQ0FBQyxDQUFBLEdBQUksQ0FBTCxDQUFBLEdBQVUsQ0FBVixHQUFjO0FBTnRCO01BT0EsQ0FBQSxJQUFLLEVBUlA7O1dBVUEsQ0FBQyxDQUFBLEdBQUksR0FBTCxFQUFVLENBQUEsR0FBSSxHQUFkLEVBQW1CLEVBQUEsR0FBSyxHQUF4QjtFQXZCUzs7RUFrQ1gsUUFBQSxHQUFXLFNBQUMsQ0FBRCxFQUFJLENBQUosRUFBTyxFQUFQO0FBQ1QsUUFBQTtJQUFBLENBQUEsR0FBSyxDQUFBLEdBQUksR0FBSixHQUFVO0lBQ2YsQ0FBQSxHQUFLLENBQUEsR0FBSTtJQUNULEVBQUEsR0FBSyxFQUFBLEdBQUs7SUFFVixJQUFJLENBQUEsSUFBSyxDQUFUO0FBQ0UsYUFBTyxDQUFDLEVBQUEsR0FBSyxHQUFOLEVBQVcsRUFBQSxHQUFLLEdBQWhCLEVBQXFCLEVBQUEsR0FBSyxHQUExQixFQURUOztJQUdBLENBQUEsR0FBSSxJQUFJLENBQUMsS0FBTCxDQUFXLENBQVg7SUFDSixDQUFBLEdBQUksQ0FBQSxHQUFJO0lBQ1IsQ0FBQSxHQUFJLENBQUEsR0FBSSxDQUFDLENBQUEsR0FBSSxDQUFMO0lBQ1IsQ0FBQSxHQUFJLENBQUEsR0FBSTtJQUNSLEdBQUEsR0FBTSxDQUFBLEdBQUk7SUFDVixDQUFBLEdBQUksQ0FBQyxDQUFELEVBQUksQ0FBSixFQUFPLENBQVAsRUFBVSxDQUFWLEVBQWEsQ0FBYixFQUFnQixDQUFoQixDQUFtQixDQUFBLEdBQUE7SUFDdkIsQ0FBQSxHQUFJLENBQUMsQ0FBRCxFQUFJLENBQUosRUFBTyxDQUFQLEVBQVUsQ0FBVixFQUFhLENBQWIsRUFBZ0IsQ0FBaEIsQ0FBbUIsQ0FBQSxHQUFBO0lBQ3ZCLENBQUEsR0FBSSxDQUFDLENBQUQsRUFBSSxDQUFKLEVBQU8sQ0FBUCxFQUFVLENBQVYsRUFBYSxDQUFiLEVBQWdCLENBQWhCLENBQW1CLENBQUEsR0FBQTtJQUN2QixDQUFBLEdBQUksQ0FBQyxDQUFBLEdBQUksQ0FBTCxDQUFBLEdBQVU7V0FFZCxDQUNFLENBQUMsQ0FBQSxHQUFJLENBQUwsQ0FBQSxHQUFVLEdBRFosRUFFRSxDQUFDLENBQUEsR0FBSSxDQUFMLENBQUEsR0FBVSxHQUZaLEVBR0UsQ0FBQyxDQUFBLEdBQUksQ0FBTCxDQUFBLEdBQVUsR0FIWjtFQWxCUzs7RUErQlgsUUFBQSxHQUFXLFNBQUMsQ0FBRCxFQUFJLENBQUosRUFBTyxDQUFQO0FBQ1QsUUFBQTtJQUFBLE1BQVEsQ0FBQyxDQUFBLEdBQUksR0FBTCxFQUFVLENBQUEsR0FBSSxHQUFkLENBQVIsRUFBQyxVQUFELEVBQUc7SUFFSCxDQUFBLEdBQUksQ0FBQyxDQUFBLEdBQUksQ0FBTCxDQUFBLEdBQVU7SUFDZCxDQUFBLEdBQUksQ0FBQSxHQUFJO1dBRVIsQ0FBQyxDQUFELEVBQUksQ0FBQSxHQUFJLEdBQVIsRUFBYSxDQUFBLEdBQUksR0FBakI7RUFOUzs7RUFlWCxRQUFBLEdBQVcsU0FBQyxDQUFELEVBQUksQ0FBSixFQUFPLENBQVA7QUFDVCxRQUFBO0lBQUEsTUFBUSxDQUFDLENBQUEsR0FBSSxHQUFMLEVBQVUsQ0FBQSxHQUFJLEdBQWQsQ0FBUixFQUFDLFVBQUQsRUFBRztJQUVILENBQUEsR0FBSSxDQUFBLEdBQUksQ0FBQyxDQUFBLEdBQUksQ0FBQyxDQUFBLEdBQUksQ0FBTCxDQUFMO0lBQ1IsQ0FBQSxHQUFJLENBQUEsR0FBSTtXQUVSLENBQUMsQ0FBRCxFQUFJLENBQUEsR0FBSSxHQUFSLEVBQWEsQ0FBQSxHQUFJLEdBQWpCO0VBTlM7O0VBaUJYLFFBQUEsR0FBVyxTQUFDLENBQUQsRUFBRyxDQUFILEVBQUssQ0FBTDtXQUFXLFFBQUEsYUFBUyxRQUFBLENBQVMsQ0FBVCxFQUFXLENBQVgsRUFBYSxDQUFiLENBQVQ7RUFBWDs7RUFXWCxRQUFBLEdBQVcsU0FBQyxDQUFELEVBQUcsQ0FBSCxFQUFLLENBQUw7V0FBVyxRQUFBLGFBQVMsUUFBQSxDQUFTLENBQVQsRUFBVyxDQUFYLEVBQWEsQ0FBYixDQUFUO0VBQVg7O0VBR1gsU0FBQSxHQUFZLFNBQUMsQ0FBRCxFQUFHLENBQUgsRUFBSyxDQUFMLEVBQU8sQ0FBUDtBQUNWLFFBQUE7SUFBQSxDQUFBLEdBQUksQ0FBQSxHQUFJLElBQUksQ0FBQyxHQUFMLENBQVMsQ0FBVCxFQUFZLENBQUEsR0FBSSxDQUFDLENBQUEsR0FBSSxDQUFMLENBQUosR0FBYyxDQUExQjtJQUNSLENBQUEsR0FBSSxDQUFBLEdBQUksSUFBSSxDQUFDLEdBQUwsQ0FBUyxDQUFULEVBQVksQ0FBQSxHQUFJLENBQUMsQ0FBQSxHQUFJLENBQUwsQ0FBSixHQUFjLENBQTFCO0lBQ1IsQ0FBQSxHQUFJLENBQUEsR0FBSSxJQUFJLENBQUMsR0FBTCxDQUFTLENBQVQsRUFBWSxDQUFBLEdBQUksQ0FBQyxDQUFBLEdBQUksQ0FBTCxDQUFKLEdBQWMsQ0FBMUI7SUFFUixDQUFBLEdBQUksSUFBSSxDQUFDLEtBQUwsQ0FBVyxDQUFBLEdBQUksR0FBZjtJQUNKLENBQUEsR0FBSSxJQUFJLENBQUMsS0FBTCxDQUFXLENBQUEsR0FBSSxHQUFmO0lBQ0osQ0FBQSxHQUFJLElBQUksQ0FBQyxLQUFMLENBQVcsQ0FBQSxHQUFJLEdBQWY7V0FFSixDQUFDLENBQUQsRUFBRyxDQUFILEVBQUssQ0FBTDtFQVRVOztFQWFaLFNBQUEsR0FBWSxTQUFDLENBQUQsRUFBRyxDQUFILEVBQUssQ0FBTDtBQUVWLFFBQUE7SUFBQSxJQUF1QixDQUFBLEtBQUssQ0FBTCxJQUFXLENBQUEsS0FBSyxDQUFoQixJQUFzQixDQUFBLEtBQUssQ0FBbEQ7QUFBQSxhQUFPLENBQUMsQ0FBRCxFQUFJLENBQUosRUFBTyxDQUFQLEVBQVUsQ0FBVixFQUFQOztJQUVBLFNBQUEsR0FBWSxDQUFBLEdBQUksQ0FBQyxDQUFBLEdBQUksR0FBTDtJQUNoQixTQUFBLEdBQVksQ0FBQSxHQUFJLENBQUMsQ0FBQSxHQUFJLEdBQUw7SUFDaEIsU0FBQSxHQUFZLENBQUEsR0FBSSxDQUFDLENBQUEsR0FBSSxHQUFMO0lBRWhCLE1BQUEsR0FBUyxJQUFJLENBQUMsR0FBTCxDQUFTLFNBQVQsRUFBb0IsSUFBSSxDQUFDLEdBQUwsQ0FBUyxTQUFULEVBQW9CLFNBQXBCLENBQXBCO0lBRVQsU0FBQSxHQUFZLENBQUMsU0FBQSxHQUFZLE1BQWIsQ0FBQSxHQUF1QixDQUFDLENBQUEsR0FBSSxNQUFMO0lBQ25DLFNBQUEsR0FBWSxDQUFDLFNBQUEsR0FBWSxNQUFiLENBQUEsR0FBdUIsQ0FBQyxDQUFBLEdBQUksTUFBTDtJQUNuQyxTQUFBLEdBQVksQ0FBQyxTQUFBLEdBQVksTUFBYixDQUFBLEdBQXVCLENBQUMsQ0FBQSxHQUFJLE1BQUw7SUFDbkMsU0FBQSxHQUFZO1dBRVosQ0FBQyxTQUFELEVBQVksU0FBWixFQUF1QixTQUF2QixFQUFrQyxTQUFsQztFQWZVOztFQWlCWixNQUFNLENBQUMsT0FBUCxHQUFpQjtJQUNmLFdBQUEsU0FEZTtJQUVmLGNBQUEsWUFGZTtJQUdmLGNBQUEsWUFIZTtJQUlmLFVBQUEsUUFKZTtJQUtmLFVBQUEsUUFMZTtJQU1mLFVBQUEsUUFOZTtJQU9mLFVBQUEsUUFQZTtJQVFmLFVBQUEsUUFSZTtJQVNmLFVBQUEsUUFUZTtJQVVmLFVBQUEsUUFWZTtJQVdmLFdBQUEsU0FYZTtJQVlmLFVBQUEsUUFaZTtJQWFmLGNBQUEsWUFiZTtJQWNmLGNBQUEsWUFkZTtJQWVmLFVBQUEsUUFmZTtJQWdCZixVQUFBLFFBaEJlO0lBaUJmLFVBQUEsUUFqQmU7SUFrQmYsVUFBQSxRQWxCZTs7QUE3YWpCIiwic291cmNlc0NvbnRlbnQiOlsiIyBQdWJsaWM6IENvbnZlcnRzIGEgY29sb3IgZGVmaW5lZCB3aXRoIGl0cyByZWQsIGdyZWVuIGFuZCBibHVlXG4jIGNvbXBvbmVudHMgaW50byBhbiBoZXhhZGVjaW1hbCB7U3RyaW5nfS5cbiNcbiMgciAtIEFuIGludGVnZXIgaW4gdGhlIHJhbmdlIFtPLTI1NV0gZm9yIHRoZSByZWQgY29tcG9uZW50XG4jIGcgLSBBbiBpbnRlZ2VyIGluIHRoZSByYW5nZSBbTy0yNTVdIGZvciB0aGUgZ3JlZW4gY29tcG9uZW50XG4jIGIgLSBBbiBpbnRlZ2VyIGluIHRoZSByYW5nZSBbTy0yNTVdIGZvciB0aGUgYmx1ZSBjb21wb25lbnRcbiNcbiMgUmV0dXJucyBhbiBoZXhhZGVjaW1hbCB7U3RyaW5nfSBhcyBgUlJHR0JCYFxucmdiVG9IZXggPSAgKHIsIGcsIGIpIC0+XG4gIHJuZCA9IE1hdGgucm91bmRcbiAgdmFsdWUgPSAoKHJuZChyKSA8PCAxNikgKyAocm5kKGcpIDw8IDgpICsgcm5kKGIpKS50b1N0cmluZyAxNlxuXG4gICMgVGhlIHZhbHVlIGlzIGZpbGxlZCB3aXRoIGAwYCB0byBtYXRjaCBhIGxlbmd0aCBvZiA2LlxuICB2YWx1ZSA9IFwiMCN7dmFsdWV9XCIgd2hpbGUgdmFsdWUubGVuZ3RoIDwgNlxuXG4gIHZhbHVlXG5cbiMgUHVibGljOiBDb252ZXJ0cyBhbiBoZXhhZGVjaW1hbCB7U3RyaW5nfSBzdWNoIGFzIGBSUkdHQkJgIGludG8gYW4gYXJyYXlcbiMgd2l0aCB0aGUgcmVkLCBncmVlbiBhbmQgYmx1ZSBjb21wb25lbnRzLlxuI1xuIyBoZXggLSBBIHtTdHJpbmd9IHN1Y2ggYXMgYFJSR0dCQmBcbiNcbiMgUmV0dXJucyBhbiB7QXJyYXl9IGNvbnRhaW5pbmcgdGhlIHJlZCwgZ3JlZW4gYW5kIGJsdWUgY29tcG9uZW50c1xuIyBvZiB0aGUgY29sb3JcbmhleFRvUkdCID0gKGhleCkgLT5cbiAgY29sb3IgPSBwYXJzZUludCBoZXgsIDE2XG5cbiAgciA9IChjb2xvciA+PiAxNikgJiAweGZmXG4gIGcgPSAoY29sb3IgPj4gOCkgJiAweGZmXG4gIGIgPSBjb2xvciAmIDB4ZmZcblxuICBbciwgZywgYl1cblxuIyBQdWJsaWM6IENvbnZlcnRzIGEgY29sb3IgZGVmaW5lZCB3aXRoIGl0cyByZWQsIGdyZWVuLFxuIyBibHVlIGFuZCBhbHBoYSBjb21wb25lbnRzIGludG8gYW4gaGV4YWRlY2ltYWwge1N0cmluZ30uXG4jXG4jIHIgLSBBbiBpbnRlZ2VyIGluIHRoZSByYW5nZSBbTy0yNTVdIGZvciB0aGUgcmVkIGNvbXBvbmVudFxuIyBnIC0gQW4gaW50ZWdlciBpbiB0aGUgcmFuZ2UgW08tMjU1XSBmb3IgdGhlIGdyZWVuIGNvbXBvbmVudFxuIyBiIC0gQW4gaW50ZWdlciBpbiB0aGUgcmFuZ2UgW08tMjU1XSBmb3IgdGhlIGJsdWUgY29tcG9uZW50XG4jIGEgLSBBIGZsb2F0IGluIHRoZSByYW5nZSBbTy0xXSBmb3IgdGhlIGFscGhhIGNvbXBvbmVudFxuI1xuIyBSZXR1cm5zIGFuIGhleGFkZWNpbWFsIHtTdHJpbmd9IGFzIGBBQVJSR0dCQmBcbnJnYlRvSGV4QVJHQiA9IChyLCBnLCBiLCBhKSAtPlxuICBybmQgPSBNYXRoLnJvdW5kXG4gIHZhbHVlID0gKFxuICAgIChybmQoYSAqIDI1NSkgPDwgMjQpICtcbiAgICAocm5kKHIpIDw8IDE2KSArXG4gICAgKHJuZChnKSA8PCA4KSArXG4gICAgcm5kKGIpXG4gICkudG9TdHJpbmcgMTZcblxuICAjIFRoZSB2YWx1ZSBpcyBmaWxsZWQgd2l0aCBgMGAgdG8gbWF0Y2ggYSBsZW5ndGggb2YgOC5cbiAgdmFsdWUgPSBcIjAje3ZhbHVlfVwiIHdoaWxlIHZhbHVlLmxlbmd0aCA8IDhcblxuICB2YWx1ZVxuXG4jIFB1YmxpYzogQ29udmVydHMgYSBjb2xvciBkZWZpbmVkIHdpdGggaXRzIHJlZCwgZ3JlZW4sXG4jIGJsdWUgYW5kIGFscGhhIGNvbXBvbmVudHMgaW50byBhbiBoZXhhZGVjaW1hbCB7U3RyaW5nfS5cbiNcbiMgciAtIEFuIGludGVnZXIgaW4gdGhlIHJhbmdlIFtPLTI1NV0gZm9yIHRoZSByZWQgY29tcG9uZW50XG4jIGcgLSBBbiBpbnRlZ2VyIGluIHRoZSByYW5nZSBbTy0yNTVdIGZvciB0aGUgZ3JlZW4gY29tcG9uZW50XG4jIGIgLSBBbiBpbnRlZ2VyIGluIHRoZSByYW5nZSBbTy0yNTVdIGZvciB0aGUgYmx1ZSBjb21wb25lbnRcbiMgYSAtIEEgZmxvYXQgaW4gdGhlIHJhbmdlIFtPLTFdIGZvciB0aGUgYWxwaGEgY29tcG9uZW50XG4jXG4jIFJldHVybnMgYW4gaGV4YWRlY2ltYWwge1N0cmluZ30gYXMgYFJSR0dCQkFBYFxucmdiVG9IZXhSR0JBID0gKHIsIGcsIGIsIGEpIC0+XG4gIHJuZCA9IE1hdGgucm91bmRcbiAgdmFsdWUgPSAoXG4gICAgKHJuZChyKSA8PCAyNCkgK1xuICAgIChybmQoZykgPDwgMTYpICtcbiAgICAocm5kKGIpIDw8IDgpICtcbiAgICBybmQoYSAqIDI1NSlcbiAgKS50b1N0cmluZyAxNlxuXG4gICMgVGhlIHZhbHVlIGlzIGZpbGxlZCB3aXRoIGAwYCB0byBtYXRjaCBhIGxlbmd0aCBvZiA4LlxuICB2YWx1ZSA9IFwiMCN7dmFsdWV9XCIgd2hpbGUgdmFsdWUubGVuZ3RoIDwgOFxuXG4gIHZhbHVlXG5cbiMgUHVibGljOiBDb252ZXJ0cyBhbiBoZXhhZGVjaW1hbCB7U3RyaW5nfSBzdWNoIGFzIGBhYXJyZ2diYmAgaW50byBhbiBhcnJheVxuIyB3aXRoIHRoZSByZWQsIGdyZWVuLCBibHVlIGFuZCBhbHBoYSBjb21wb25lbnRzIHZhbHVlcy5cbiNcbiMgaGV4IC0gQSB7U3RyaW5nfSBzdWNoIGFzIGBBQVJSR0dCQmBcbiNcbiMgUmV0dXJucyBhbiB7QXJyYXl9IGNvbnRhaW5pbmcgdGhlIHJlZCwgZ3JlZW4sIGJsdWUgYW5kIGFscGhhIGNvbXBvbmVudHNcbiMgb2YgdGhlIGNvbG9yXG5oZXhBUkdCVG9SR0IgPSAoaGV4KSAtPlxuICBjb2xvciA9IHBhcnNlSW50IGhleCwgMTZcblxuICBhID0gKChjb2xvciA+PiAyNCkgJiAweGZmKSAvIDI1NVxuICByID0gKGNvbG9yID4+IDE2KSAmIDB4ZmZcbiAgZyA9IChjb2xvciA+PiA4KSAmIDB4ZmZcbiAgYiA9IGNvbG9yICYgMHhmZlxuXG4gIFtyLCBnLCBiLCBhXVxuXG5cbiMgUHVibGljOiBDb252ZXJ0cyBhbiBoZXhhZGVjaW1hbCB7U3RyaW5nfSBzdWNoIGFzIGBycmdnYmJhYWAgaW50byBhbiBhcnJheVxuIyB3aXRoIHRoZSByZWQsIGdyZWVuLCBibHVlIGFuZCBhbHBoYSBjb21wb25lbnRzIHZhbHVlcy5cbiNcbiMgaGV4IC0gQSB7U3RyaW5nfSBzdWNoIGFzIGBSUkdHQkJBQWBcbiNcbiMgUmV0dXJucyBhbiB7QXJyYXl9IGNvbnRhaW5pbmcgdGhlIHJlZCwgZ3JlZW4sIGJsdWUgYW5kIGFscGhhIGNvbXBvbmVudHNcbiMgb2YgdGhlIGNvbG9yXG5oZXhSR0JBVG9SR0IgPSAoaGV4KSAtPlxuICBjb2xvciA9IHBhcnNlSW50IGhleCwgMTZcblxuICByID0gKChjb2xvciA+PiAyNCkgJiAweGZmKVxuICBnID0gKGNvbG9yID4+IDE2KSAmIDB4ZmZcbiAgYiA9IChjb2xvciA+PiA4KSAmIDB4ZmZcbiAgYSA9IChjb2xvciAmIDB4ZmYpIC8gMjU1XG5cbiAgW3IsIGcsIGIsIGFdXG5cbiMgUHVibGljOiBDb252ZXJ0cyBhIGNvbG9yIGluIHRoZSBgcmdiYCBjb2xvciBzcGFjZSBpbiBhblxuIyB7QXJyYXl9IHdpdGggdGhlIGNvbG9yIGluIHRoZSBgaHN2YCBjb2xvciBzcGFjZS5cbiNcbiMgciAtIEFuIGludGVnZXIgaW4gdGhlIHJhbmdlIFtPLTI1NV0gZm9yIHRoZSByZWQgY29tcG9uZW50XG4jIGcgLSBBbiBpbnRlZ2VyIGluIHRoZSByYW5nZSBbTy0yNTVdIGZvciB0aGUgZ3JlZW4gY29tcG9uZW50XG4jIGIgLSBBbiBpbnRlZ2VyIGluIHRoZSByYW5nZSBbTy0yNTVdIGZvciB0aGUgYmx1ZSBjb21wb25lbnRcbiNcbiMgUmV0dXJucyBhbiB7QXJyYXl9IGNvbnRhaW5pbmcgdGhlIGh1ZSwgc2F0dXJhdGlvbiBhbmQgdmFsdWUgb2YgdGhlIGNvbG9yXG5yZ2JUb0hTViA9IChyLCBnLCBiKSAtPlxuXG4gIHIgPSByIC8gMjU1XG4gIGcgPSBnIC8gMjU1XG4gIGIgPSBiIC8gMjU1XG4gIHJuZCA9IE1hdGgucm91bmRcblxuICBtaW5WYWwgPSBNYXRoLm1pbiByLCBnLCBiXG4gIG1heFZhbCA9IE1hdGgubWF4IHIsIGcsIGJcbiAgZGVsdGEgPSBtYXhWYWwgLSBtaW5WYWxcblxuICAjIFZhbHVlIGlzIGFsd2F5cyB0aGUgbWF4aW1hbCBjb21wb25lbnQncyB2YWx1ZS5cbiAgdiA9IG1heFZhbFxuXG4gICMgVGhlIGNvbG9yIGlzIGEgZ3JheSwgdGhlcmUncyBubyBuZWVkIHRvIHByb2NlZWQgZnVydGhlci5cbiAgIyBCb3RoIHNhdHVyYXRpb24gYW5kIGh1ZSBlcXVhbHMgdG8gYDBgLlxuICBpZiBkZWx0YSBpcyAwXG4gICAgaCA9IDBcbiAgICBzID0gMFxuICBlbHNlXG4gICAgIyBUaGUgbG93ZXIgdGhlIGRlbHRhIGlzIGluIGNvbXBhcmlzb24gd2l0aCB0aGUgdmFsdWVcbiAgICAjIHRoZSBoaWdoZXIgdGhlIHNhdHVyYXRpb24gd2lsbCBiZS5cbiAgICBzID0gZGVsdGEgLyB2XG4gICAgZGVsdGFSID0gKCgodiAtIHIpIC8gNikgKyAoZGVsdGEgLyAyKSkgLyBkZWx0YVxuICAgIGRlbHRhRyA9ICgoKHYgLSBnKSAvIDYpICsgKGRlbHRhIC8gMikpIC8gZGVsdGFcbiAgICBkZWx0YUIgPSAoKCh2IC0gYikgLyA2KSArIChkZWx0YSAvIDIpKSAvIGRlbHRhXG5cbiAgICAjIEluIGEgcmFuZ2UgZnJvbSBgMGAgdG8gYDFgLCBmdWxsIHJlZCBpcyBhdCBgMGAgYW5kIGAxYCxcbiAgICAjIGZ1bGwgZ3JlZW4gaXMgYXQgYDEvM2AgYW5kIGZ1bGwgYmx1ZSBhdCBgMi8zYC5cbiAgICAjXG4gICAgIyBGcm9tIHRoZSBwb2ludCBpbiB0aGUgcmFuZ2UgY29ycmVzcG9uZGluZyB0byB0aGUgZG9taW5hbnRcbiAgICAjIGNvbXBvbmVudCwgdGhlIGRlbHRhIG9mIHRoZSBvdGhlciBjb21wb25lbnRzIGFyZSBib3RoIGFkZGVkXG4gICAgIyBpbiBvcmRlciB0byBtb3ZlIHRoZSBodWUgYXJvdW5kIHRoaXMgcG9pbnQuXG4gICAgaWYgciBpcyB2ICAgICAgdGhlbiBoID0gZGVsdGFCIC0gZGVsdGFHXG4gICAgZWxzZSBpZiBnIGlzIHYgdGhlbiBoID0gKDEgLyAzKSArIGRlbHRhUiAtIGRlbHRhQlxuICAgIGVsc2UgaWYgYiA9PSB2IHRoZW4gaCA9ICgyIC8gMykgKyBkZWx0YUcgLSBkZWx0YVJcblxuICAgICMgSHVlIGlzIHRoZW4gcmVkdWNlZCB0byBmaXQgaW4gdGhlIGAwLTFgIHJhbmdlLlxuICAgIGggKz0gMSBpZiBoIDwgMFxuICAgIGggLT0gMSBpZiBoID4gMVxuXG4gICMgQW5kLCBmaW5hbGx5LCBodWUsIHNhdHVyYXRpb24gYW5kIHZhbHVlIGFyZSBub3JtYWxpemVkXG4gICMgdG8gdGhlaXIgY29ycmVzcG9uZGluZyByYW5nZS5cbiAgW2ggKiAzNjAsIHMgKiAxMDAsIHYgKiAxMDBdXG5cbiMgUHVibGljOiBDb252ZXJ0cyBhIGNvbG9yIGRlZmluZWQgaW4gdGhlIGBoc3ZgIGNvbG9yIHNwYWNlIGludG9cbiMgYW4ge0FycmF5fSBjb250YWluaW5nIHRoZSBjb2xvciBpbiB0aGUgYHJnYmAgY29sb3Igc3BhY2UuXG4jXG4jIGggLSBBbiBpbnRlZ2VyIGluIHRoZSByYW5nZSBbTy0zNjBdIGZvciB0aGUgaHVlIGNvbXBvbmVudFxuIyBzIC0gQSBmbG9hdCBpbiB0aGUgcmFuZ2UgW08tMTAwXSBmb3IgdGhlIHNhdHVyYXRpb24gY29tcG9uZW50XG4jIHYgLSBBIGZsb2F0IGluIHRoZSByYW5nZSBbTy0xMDBdIGZvciB0aGUgdmFsdWUgY29tcG9uZW50XG4jXG4jIFJldHVybnMgYW4ge0FycmF5fSBjb250YWluaW5nIHRoZSByZWQsIGdyZWVuIGFuZCBibHVlIGNvbXBvbmVudHNcbiMgb2YgdGhlIGNvbG9yXG5oc3ZUb1JHQiA9IChoLCBzLCB2KSAtPlxuICAjIEh1ZSBpcyByZWR1Y2VkIHRvIHRoZSBgMC02YCByYW5nZSB3aGVuIGJvdGggc2F0dXJhdGlvblxuICAjIGFuZCB2YWx1ZSBhcmUgcmVkdWNlZCB0byB0aGUgYDAtMWBcbiAgaCA9IGggLyA2MFxuICBzID0gcyAvIDEwMFxuICB2ID0gdiAvIDEwMFxuICBybmQgPSBNYXRoLnJvdW5kXG5cbiAgIyBTaG9ydCBjaXJjdWl0IHdoZW4gc2F0dXJhdGlvbiBpcyBgMGAsIGFsbCBvdGhlciBjb21wb25lbnRzXG4gICMgd2lsbCBlbmQgdXAgdG8gYDBgIGFzIHdlbGwuXG4gIGlmIHMgaXMgMFxuICAgIHJldHVybiBbcm5kKHYgKiAyNTUpLCBybmQodiAqIDI1NSksIHJuZCh2ICogMjU1KV1cbiAgZWxzZVxuICAgICMgQnkgcm91bmRpbmcgdGhlIGh1ZSB3ZSBvYnRhaW4gdGhlIGRvbWluYW50XG4gICAgIyBjb2xvciBzdWNoIGFzIDpcbiAgICAjXG4gICAgIyAgKiAwID0gUmVkXG4gICAgIyAgKiAxID0gWWVsbG93XG4gICAgIyAgKiAyID0gR3JlZW5cbiAgICAjICAqIDMgPSBDeWFuXG4gICAgIyAgKiA0ID0gQmx1ZVxuICAgICMgICogNSA9IE1hZ2VudGFcbiAgICBkb21pbmFudCA9IE1hdGguZmxvb3IgaFxuXG4gICAgY29tcDEgPSB2ICogKDEgLSBzKVxuICAgIGNvbXAyID0gdiAqICgxIC0gcyAqIChoIC0gZG9taW5hbnQpKVxuICAgIGNvbXAzID0gdiAqICgxIC0gcyAqICgxIC0gKGggLSBkb21pbmFudCkpKVxuXG4gICAgIyBBY2NvcmRpbmcgdG8gdGhlIGRvbWluYW50IGNvbG9yIHdlIGFmZmVjdFxuICAgICMgdGhlIHZhbHVlcyB0byBlYWNoIGNvbXBvbmVudC5cbiAgICBzd2l0Y2ggZG9taW5hbnRcbiAgICAgIHdoZW4gMCB0aGVuIFtyLCBnLCBiXSA9IFt2LCBjb21wMywgY29tcDFdXG4gICAgICB3aGVuIDEgdGhlbiBbciwgZywgYl0gPSBbY29tcDIsIHYsIGNvbXAxXVxuICAgICAgd2hlbiAyIHRoZW4gW3IsIGcsIGJdID0gW2NvbXAxLCB2LCBjb21wM11cbiAgICAgIHdoZW4gMyB0aGVuIFtyLCBnLCBiXSA9IFtjb21wMSwgY29tcDIsIHZdXG4gICAgICB3aGVuIDQgdGhlbiBbciwgZywgYl0gPSBbY29tcDMsIGNvbXAxLCB2XVxuICAgICAgZWxzZSAgICAgICAgW3IsIGcsIGJdID0gW3YsIGNvbXAxLCBjb21wMl1cblxuICAgICMgQW5kIGVhY2ggY29tcG9uZW50IGlzIG5vcm1hbGl6ZWQgdG8gZml0XG4gICAgIyBpbiBgMC0yNTVgIHJhbmdlLlxuICAgIHJldHVybiBbciAqIDI1NSwgZyAqIDI1NSwgYiAqIDI1NV1cblxuIyBQdWJsaWM6IENvbnZlcnRzIGEgY29sb3IgaW4gdGhlIGByZ2JgIGNvbG9yIHNwYWNlIGluIGFuXG4jIHtBcnJheX0gd2l0aCB0aGUgY29sb3IgaW4gdGhlIGBoc2xgIGNvbG9yIHNwYWNlLlxuI1xuIyByIC0gQW4gaW50ZWdlciBpbiB0aGUgcmFuZ2UgW08tMjU1XSBmb3IgdGhlIHJlZCBjb21wb25lbnRcbiMgZyAtIEFuIGludGVnZXIgaW4gdGhlIHJhbmdlIFtPLTI1NV0gZm9yIHRoZSBncmVlbiBjb21wb25lbnRcbiMgYiAtIEFuIGludGVnZXIgaW4gdGhlIHJhbmdlIFtPLTI1NV0gZm9yIHRoZSBibHVlIGNvbXBvbmVudFxuI1xuIyBSZXR1cm5zIGFuIHtBcnJheX0gY29udGFpbmluZyB0aGUgaHVlLCBzYXR1cmF0aW9uIGFuZCBsdW1pbmFuY2Ugb2YgdGhlIGNvbG9yXG5yZ2JUb0hTTCA9IChyLCBnLCBiKSAtPlxuICBbcixnLGJdID0gW1xuICAgIHIgLyAyNTVcbiAgICBnIC8gMjU1XG4gICAgYiAvIDI1NVxuICBdXG4gIG1heCA9IE1hdGgubWF4KHIsIGcsIGIpXG4gIG1pbiA9IE1hdGgubWluKHIsIGcsIGIpXG4gIGggPSB1bmRlZmluZWRcbiAgcyA9IHVuZGVmaW5lZFxuICBsID0gKG1heCArIG1pbikgLyAyXG4gIGQgPSBtYXggLSBtaW5cbiAgaWYgbWF4IGlzIG1pblxuICAgIGggPSBzID0gMFxuICBlbHNlXG4gICAgcyA9IChpZiBsID4gMC41IHRoZW4gZCAvICgyIC0gbWF4IC0gbWluKSBlbHNlIGQgLyAobWF4ICsgbWluKSlcbiAgICBzd2l0Y2ggbWF4XG4gICAgICB3aGVuIHJcbiAgICAgICAgaCA9IChnIC0gYikgLyBkICsgKChpZiBnIDwgYiB0aGVuIDYgZWxzZSAwKSlcbiAgICAgIHdoZW4gZ1xuICAgICAgICBoID0gKGIgLSByKSAvIGQgKyAyXG4gICAgICB3aGVuIGJcbiAgICAgICAgaCA9IChyIC0gZykgLyBkICsgNFxuICAgIGggLz0gNlxuXG4gIFtoICogMzYwLCBzICogMTAwLCBsICogMTAwXVxuXG4jIFB1YmxpYzogQ29udmVydHMgYSBjb2xvciBkZWZpbmVkIGluIHRoZSBgaHNsYCBjb2xvciBzcGFjZSBpbnRvXG4jIGFuIHtBcnJheX0gY29udGFpbmluZyB0aGUgY29sb3IgaW4gdGhlIGByZ2JgIGNvbG9yIHNwYWNlLlxuI1xuIyBoIC0gQW4gaW50ZWdlciBpbiB0aGUgcmFuZ2UgW08tMzYwXSBmb3IgdGhlIGh1ZSBjb21wb25lbnRcbiMgcyAtIEEgZmxvYXQgaW4gdGhlIHJhbmdlIFtPLTEwMF0gZm9yIHRoZSBzYXR1cmF0aW9uIGNvbXBvbmVudFxuIyBsIC0gQSBmbG9hdCBpbiB0aGUgcmFuZ2UgW08tMTAwXSBmb3IgdGhlIGx1bWluYW5jZSBjb21wb25lbnRcbiNcbiMgUmV0dXJucyBhbiB7QXJyYXl9IGNvbnRhaW5pbmcgdGhlIHJlZCwgZ3JlZW4gYW5kIGJsdWUgY29tcG9uZW50c1xuIyBvZiB0aGUgY29sb3JcbmhzbFRvUkdCID0gKGgsIHMsIGwpIC0+XG4gIGNsYW1wID0gKHZhbCkgLT4gTWF0aC5taW4gMSwgTWF0aC5tYXgoMCwgdmFsKVxuXG4gIGh1ZSA9IChoKSAtPlxuICAgIGggPSAoaWYgaCA8IDAgdGhlbiBoICsgMSBlbHNlICgoaWYgaCA+IDEgdGhlbiBoIC0gMSBlbHNlIGgpKSlcbiAgICBpZiBoICogNiA8IDFcbiAgICAgIG0xICsgKG0yIC0gbTEpICogaCAqIDZcbiAgICBlbHNlIGlmIGggKiAyIDwgMVxuICAgICAgbTJcbiAgICBlbHNlIGlmIGggKiAzIDwgMlxuICAgICAgbTEgKyAobTIgLSBtMSkgKiAoMiAvIDMgLSBoKSAqIDZcbiAgICBlbHNlXG4gICAgICBtMVxuXG4gIGggPSAoaCAlIDM2MCkgLyAzNjBcbiAgcyA9IGNsYW1wKHMgLyAxMDApXG4gIGwgPSBjbGFtcChsIC8gMTAwKVxuICBtMiA9IChpZiBsIDw9IDAuNSB0aGVuIGwgKiAocyArIDEpIGVsc2UgbCArIHMgLSBsICogcylcbiAgbTEgPSBsICogMiAtIG0yXG5cbiAgcmV0dXJuIFtcbiAgICBodWUoaCArIDEgLyAzKSAqIDI1NVxuICAgIGh1ZShoKSAqIDI1NVxuICAgIGh1ZShoIC0gMSAvIDMpICogMjU1XG4gIF1cblxuIyBQdWJsaWM6IENvbnZlcnRzIGEgY29sb3IgaW4gdGhlIGByZ2JgIGNvbG9yIHNwYWNlIGluIGFuXG4jIHtBcnJheX0gd2l0aCB0aGUgY29sb3IgaW4gdGhlIGBoY2dgIGNvbG9yIHNwYWNlLlxuI1xuIyByIC0gQW4gaW50ZWdlciBpbiB0aGUgcmFuZ2UgW08tMjU1XSBmb3IgdGhlIHJlZCBjb21wb25lbnRcbiMgZyAtIEFuIGludGVnZXIgaW4gdGhlIHJhbmdlIFtPLTI1NV0gZm9yIHRoZSBncmVlbiBjb21wb25lbnRcbiMgYiAtIEFuIGludGVnZXIgaW4gdGhlIHJhbmdlIFtPLTI1NV0gZm9yIHRoZSBibHVlIGNvbXBvbmVudFxuI1xuIyBSZXR1cm5zIGFuIHtBcnJheX0gY29udGFpbmluZyB0aGUgaHVlLCBjaHJvbWEgYW5kIGdyYXluZXNzIG9mIHRoZSBjb2xvclxucmdiVG9IQ0cgPSAociwgZywgYikgLT5cbiAgciA9IHIgLyAyNTVcbiAgZyA9IGcgLyAyNTVcbiAgYiA9IGIgLyAyNTVcbiAgbWF4ID0gTWF0aC5tYXgociwgZywgYilcbiAgbWluID0gTWF0aC5taW4ociwgZywgYilcbiAgYyA9IChtYXggLSBtaW4pXG4gIGdyID0gMFxuICBoID0gMFxuXG4gIGlmIChjIDwgMSlcbiAgICBnciA9IG1pbiAvICgxIC0gYylcblxuICBpZiAoYyA+IDApXG4gICAgc3dpdGNoIChtYXgpXG4gICAgICB3aGVuIHJcbiAgICAgICAgaCA9IChnIC0gYikgLyBjICsgKGcgPCBiID8gNiA6IDApXG4gICAgICB3aGVuIGdcbiAgICAgICAgaCA9IChiIC0gcikgLyBjICsgMlxuICAgICAgd2hlbiBiXG4gICAgICAgIGggPSAociAtIGcpIC8gYyArIDRcbiAgICBoIC89IDZcblxuICBbaCAqIDM2MCwgYyAqIDEwMCwgZ3IgKiAxMDBdXG5cbiMgUHVibGljOiBDb252ZXJ0cyBhIGNvbG9yIGRlZmluZWQgaW4gdGhlIGBoY2dgIGNvbG9yIHNwYWNlIGludG9cbiMgYW4ge0FycmF5fSBjb250YWluaW5nIHRoZSBjb2xvciBpbiB0aGUgYHJnYmAgY29sb3Igc3BhY2UuXG4jXG4jIGggLSBBbiBpbnRlZ2VyIGluIHRoZSByYW5nZSBbTy0zNjBdIGZvciB0aGUgaHVlIGNvbXBvbmVudFxuIyBjIC0gQSBmbG9hdCBpbiB0aGUgcmFuZ2UgW08tMTAwXSBmb3IgdGhlIGNocm9tYSBjb21wb25lbnRcbiMgZ3IgLSBBIGZsb2F0IGluIHRoZSByYW5nZSBbTy0xMDBdIGZvciB0aGUgZ3JheW5lc3MgY29tcG9uZW50XG4jXG4jIFJldHVybnMgYW4ge0FycmF5fSBjb250YWluaW5nIHRoZSByZWQsIGdyZWVuIGFuZCBibHVlIGNvbXBvbmVudHNcbiMgb2YgdGhlIGNvbG9yXG5oY2dUb1JHQiA9IChoLCBjLCBncikgLT5cbiAgaCAgPSBoIC8gMzYwICogNlxuICBjICA9IGMgLyAxMDBcbiAgZ3IgPSBnciAvIDEwMFxuXG4gIGlmIChjIDw9IDApXG4gICAgcmV0dXJuIFtnciAqIDI1NSwgZ3IgKiAyNTUsIGdyICogMjU1XVxuXG4gIGkgPSBNYXRoLmZsb29yKGgpXG4gIGYgPSBoIC0gaVxuICBxID0gYyAqICgxIC0gZilcbiAgdCA9IGMgKiBmXG4gIG1vZCA9IGkgJSA2XG4gIHIgPSBbYywgcSwgMCwgMCwgdCwgY11bbW9kXVxuICBnID0gW3QsIGMsIGMsIHEsIDAsIDBdW21vZF1cbiAgYiA9IFswLCAwLCB0LCBjLCBjLCBxXVttb2RdXG4gIG0gPSAoMSAtIGMpICogZ3JcblxuICBbXG4gICAgKHIgKyBtKSAqIDI1NSxcbiAgICAoZyArIG0pICogMjU1LFxuICAgIChiICsgbSkgKiAyNTVcbiAgXVxuXG4jIFB1YmxpYzogQ29udmVydHMgYSBjb2xvciBmcm9tIHRoZSBgaHN2YCBjb2xvciBzcGFjZSB0byB0aGUgYGh3YmAgb25lLlxuI1xuIyBoIC0gVGhlIHtOdW1iZXJ9IGZvciB0aGUgaHVlIGNvbXBvbmVudC5cbiMgcyAtIFRoZSB7TnVtYmVyfSBmb3IgdGhlIHNhdHVyYXRpb24gY29tcG9uZW50LlxuIyB2IC0gVGhlIHtOdW1iZXJ9IGZvciB0aGUgdmFsdWUgY29tcG9uZW50LlxuI1xuIyBSZXR1cm5zIGFuIHtBcnJheX0gY29udGFpbmluZyB0aGUgaHVlLCB3aGl0ZW5lc3MgYW5kIGJsYWNrbmVzcyBvZiB0aGUgY29sb3IuXG5oc3ZUb0hXQiA9IChoLCBzLCB2KSAtPlxuICBbcyx2XSA9IFtzIC8gMTAwLCB2IC8gMTAwXVxuXG4gIHcgPSAoMSAtIHMpICogdlxuICBiID0gMSAtIHZcblxuICBbaCwgdyAqIDEwMCwgYiAqIDEwMF1cblxuIyBQdWJsaWM6IENvbnZlcnRzIGEgY29sb3IgZnJvbSB0aGUgYGh3YmAgY29sb3Igc3BhY2UgdG8gdGhlIGBoc3ZgIG9uZS5cbiNcbiMgaCAtIFRoZSB7TnVtYmVyfSBmb3IgdGhlIGh1ZSBjb21wb25lbnQuXG4jIHcgLSBUaGUge051bWJlcn0gZm9yIHRoZSB3aGl0ZW5lc3MgY29tcG9uZW50LlxuIyBiIC0gVGhlIHtOdW1iZXJ9IGZvciB0aGUgYmxhY2tuZXNzIGNvbXBvbmVudC5cbiNcbiMgUmV0dXJucyBhbiB7QXJyYXl9IHdpdGggdGhlIGh1ZSwgc2F0dXJhdGlvbiBhbmQgdmFsdWUgb2YgdGhlIGNvbG9yLlxuaHdiVG9IU1YgPSAoaCwgdywgYikgLT5cbiAgW3csYl0gPSBbdyAvIDEwMCwgYiAvIDEwMF1cblxuICBzID0gMSAtICh3IC8gKDEgLSBiKSlcbiAgdiA9IDEgLSBiXG5cbiAgW2gsIHMgKiAxMDAsIHYgKiAxMDBdXG5cbiMgUHVibGljOiBDb252ZXJ0cyBhIGNvbG9yIGluIHRoZSBgcmdiYCBjb2xvciBzcGFjZSBpbiBhblxuIyB7QXJyYXl9IHdpdGggdGhlIGNvbG9yIGluIHRoZSBgaHdiYCBjb2xvciBzcGFjZS5cbiNcbiMgciAtIEFuIGludGVnZXIgaW4gdGhlIHJhbmdlIFtPLTI1NV0gZm9yIHRoZSByZWQgY29tcG9uZW50XG4jIGcgLSBBbiBpbnRlZ2VyIGluIHRoZSByYW5nZSBbTy0yNTVdIGZvciB0aGUgZ3JlZW4gY29tcG9uZW50XG4jIGIgLSBBbiBpbnRlZ2VyIGluIHRoZSByYW5nZSBbTy0yNTVdIGZvciB0aGUgYmx1ZSBjb21wb25lbnRcbiNcbiMgUmV0dXJucyBhbiB7QXJyYXl9IGNvbnRhaW5pbmcgdGhlIGh1ZSwgd2hpdGVuZXNzIGFuZCBibGFja25lc3NcbiMgb2YgdGhlIGNvbG9yLlxucmdiVG9IV0IgPSAocixnLGIpIC0+IGhzdlRvSFdCKHJnYlRvSFNWKHIsZyxiKS4uLilcblxuIyBQdWJsaWM6IENvbnZlcnRzIGEgY29sb3IgZGVmaW5lZCBpbiB0aGUgYGh3YmAgY29sb3Igc3BhY2UgaW50b1xuIyBhbiB7QXJyYXl9IGNvbnRhaW5pbmcgdGhlIGNvbG9yIGluIHRoZSBgcmdiYCBjb2xvciBzcGFjZS5cbiNcbiMgaCAtIEFuIGludGVnZXIge051bWJlcn0gaW4gdGhlIHJhbmdlIFtPLTM2MF0gZm9yIHRoZSBodWUgY29tcG9uZW50LlxuIyB3IC0gQSBmbG9hdCB7TnVtYmVyfSBpbiB0aGUgcmFuZ2UgW08tMTAwXSBmb3IgdGhlIHdoaXRlbmVzcyBjb21wb25lbnQuXG4jIGIgLSBBIGZsb2F0IHtOdW1iZXJ9IGluIHRoZSByYW5nZSBbTy0xMDBdIGZvciB0aGUgYmxhY2tuZXNzIGNvbXBvbmVudC5cbiNcbiMgUmV0dXJucyBhbiB7QXJyYXl9IGNvbnRhaW5pbmcgdGhlIHJlZCwgZ3JlZW4gYW5kIGJsdWUgY29tcG9uZW50cy5cbiMgb2YgdGhlIGNvbG9yXG5od2JUb1JHQiA9IChoLHcsYikgLT4gaHN2VG9SR0IoaHdiVG9IU1YoaCx3LGIpLi4uKVxuXG4jIFB1YmxpYzogQ29udmVydHMgYSBjb2xvciBmcm9tIHRoZSBDTVlLIGNvbG9yIHNwYWNlIHRvIHRoZSBSR0IgY29sb3Igc3BhY2VcbmNteWtUb1JHQiA9IChjLG0seSxrKSAtPlxuICByID0gMSAtIE1hdGgubWluKDEsIGMgKiAoMSAtIGspICsgaylcbiAgZyA9IDEgLSBNYXRoLm1pbigxLCBtICogKDEgLSBrKSArIGspXG4gIGIgPSAxIC0gTWF0aC5taW4oMSwgeSAqICgxIC0gaykgKyBrKVxuXG4gIHIgPSBNYXRoLmZsb29yKHIgKiAyNTUpXG4gIGcgPSBNYXRoLmZsb29yKGcgKiAyNTUpXG4gIGIgPSBNYXRoLmZsb29yKGIgKiAyNTUpXG5cbiAgW3IsZyxiXVxuXG5cbiMgUHVibGljOiBDb252ZXJ0cyBhIGNvbG9yIGZyb20gdGhlIFJHQiBjb2xvciBzcGFjZSB0byB0aGUgQ01ZSyBjb2xvciBzcGFjZVxucmdiVG9DTVlLID0gKHIsZyxiKSAtPlxuICAjIEJMQUNLXG4gIHJldHVybiBbMCwgMCwgMCwgMV0gaWYgciA9PSAwIGFuZCBnID09IDAgYW5kIGIgPT0gMFxuXG4gIGNvbXB1dGVkQyA9IDEgLSAociAvIDI1NSlcbiAgY29tcHV0ZWRNID0gMSAtIChnIC8gMjU1KVxuICBjb21wdXRlZFkgPSAxIC0gKGIgLyAyNTUpXG5cbiAgbWluQ01ZID0gTWF0aC5taW4oY29tcHV0ZWRDLCBNYXRoLm1pbihjb21wdXRlZE0sIGNvbXB1dGVkWSkpXG5cbiAgY29tcHV0ZWRDID0gKGNvbXB1dGVkQyAtIG1pbkNNWSkgLyAoMSAtIG1pbkNNWSlcbiAgY29tcHV0ZWRNID0gKGNvbXB1dGVkTSAtIG1pbkNNWSkgLyAoMSAtIG1pbkNNWSlcbiAgY29tcHV0ZWRZID0gKGNvbXB1dGVkWSAtIG1pbkNNWSkgLyAoMSAtIG1pbkNNWSlcbiAgY29tcHV0ZWRLID0gbWluQ01ZXG5cbiAgW2NvbXB1dGVkQywgY29tcHV0ZWRNLCBjb21wdXRlZFksIGNvbXB1dGVkS11cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIGNteWtUb1JHQlxuICBoZXhBUkdCVG9SR0JcbiAgaGV4UkdCQVRvUkdCXG4gIGhleFRvUkdCXG4gIGhzbFRvUkdCXG4gIGhzdlRvSFdCXG4gIGhzdlRvUkdCXG4gIGhjZ1RvUkdCXG4gIGh3YlRvSFNWXG4gIGh3YlRvUkdCXG4gIHJnYlRvQ01ZS1xuICByZ2JUb0hleFxuICByZ2JUb0hleEFSR0JcbiAgcmdiVG9IZXhSR0JBXG4gIHJnYlRvSFNMXG4gIHJnYlRvSFNWXG4gIHJnYlRvSFdCXG4gIHJnYlRvSENHXG59XG4iXX0=
