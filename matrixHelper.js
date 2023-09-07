var matrixHelper = {
    strassenMatrixMultiplication: function(A, B) {
        // Vérifiez que les matrices sont de la même taille et sont des matrices carrées
        if (A.length !== A[0].length || B.length !== B[0].length || A.length !== B.length) {
          throw new Error("Les matrices ne sont pas de la même taille ou ne sont pas carrées.");
        }
      
        // Fonction de base pour multiplier deux matrices 2x2
        function multiply2x2(matrix1, matrix2) {
          const a = matrix1[0][0];
          const b = matrix1[0][1];
          const c = matrix1[1][0];
          const d = matrix1[1][1];
          const e = matrix2[0][0];
          const f = matrix2[0][1];
          const g = matrix2[1][0];
          const h = matrix2[1][1];
      
          const p1 = a * (f - h);
          const p2 = (a + b) * h;
          const p3 = (c + d) * e;
          const p4 = d * (g - e);
          const p5 = (a + d) * (e + h);
          const p6 = (b - d) * (g + h);
          const p7 = (a - c) * (e + f);
      
          const result = [
            [p5 + p4 - p2 + p6, p1 + p2],
            [p3 + p4, p1 + p5 - p3 - p7],
          ];
      
          return result;
        }
      
        // Fonction récursive pour multiplier des matrices de taille arbitraire
        function multiplyMatrix(matrix1, matrix2) {
          const size = matrix1.length;
      
          // Cas de base : si la matrice est de taille 2x2, utilisez la méthode directe
          if (size === 2) {
            return multiply2x2(matrix1, matrix2);
          }
      
          // Divisez les matrices en sous-matrices
          const halfSize = size / 2;
          const A11 = [];
          const A12 = [];
          const A21 = [];
          const A22 = [];
          const B11 = [];
          const B12 = [];
          const B21 = [];
          const B22 = [];
      
          // Remplissez les sous-matrices avec les éléments appropriés de la matrice d'origine
      
          // Calculez les produits intermédiaires
          const P1 = multiplyMatrix(A11, B11);
          const P2 = multiplyMatrix(A12, B21);
          const P3 = multiplyMatrix(A11, B12);
          const P4 = multiplyMatrix(A12, B22);
          const P5 = multiplyMatrix(A22, B12);
          const P6 = multiplyMatrix(A21, B11);
          const P7 = multiplyMatrix(A22, B21);
      
          // Calculez les sous-produits finaux
          const C11 = addMatrix(subtractMatrix(addMatrix(P1, P4), P5), P7);
          const C12 = addMatrix(P3, P5);
          const C21 = addMatrix(P2, P4);
          const C22 = addMatrix(subtractMatrix(addMatrix(P1, P3), P2), P6);
      
          // Combinez les sous-matrices pour obtenir la matrice résultante
          const result = [];
          for (let i = 0; i < size; i++) {
            result[i] = [];
            for (let j = 0; j < size; j++) {
              if (i < halfSize && j < halfSize) {
                result[i][j] = C11[i][j];
              } else if (i < halfSize && j >= halfSize) {
                result[i][j] = C12[i][j - halfSize];
              } else if (i >= halfSize && j < halfSize) {
                result[i][j] = C21[i - halfSize][j];
              } else {
                result[i][j] = C22[i - halfSize][j - halfSize];
              }
            }
          }
      
          return result;
        }
      
        return multiplyMatrix(A, B);
      }
};

var m3 = {
  projection: function(width, height) {
    // Note: This matrix flips the Y axis so that 0 is at the top.
    return [
      2 / width, 0, 0,
      0, -2 / height, 0,
      -1, 1, 1
    ];
  },

  identity: function() {
    return [
      1, 0, 0,
      0, 1, 0,
      0, 0, 1,
    ];
  },
  translation: function(tx, ty) {
    return [
      1, 0, 0,
      0, 1, 0,
      tx, ty, 1,
    ];
  },
 
  rotation: function(angleInRadians) {
    var c = Math.cos(angleInRadians);
    var s = Math.sin(angleInRadians);
    return [
      c,-s, 0,
      s, c, 0,
      0, 0, 1,
    ];
  },
 
  scaling: function(sx, sy) {
    return [
      sx, 0, 0,
      0, sy, 0,
      0, 0, 1,
    ];
  },

  multiply: function(a, b) {
    var a00 = a[0 * 3 + 0];
    var a01 = a[0 * 3 + 1];
    var a02 = a[0 * 3 + 2];
    var a10 = a[1 * 3 + 0];
    var a11 = a[1 * 3 + 1];
    var a12 = a[1 * 3 + 2];
    var a20 = a[2 * 3 + 0];
    var a21 = a[2 * 3 + 1];
    var a22 = a[2 * 3 + 2];
    var b00 = b[0 * 3 + 0];
    var b01 = b[0 * 3 + 1];
    var b02 = b[0 * 3 + 2];
    var b10 = b[1 * 3 + 0];
    var b11 = b[1 * 3 + 1];
    var b12 = b[1 * 3 + 2];
    var b20 = b[2 * 3 + 0];
    var b21 = b[2 * 3 + 1];
    var b22 = b[2 * 3 + 2];
    return [
      b00 * a00 + b01 * a10 + b02 * a20,
      b00 * a01 + b01 * a11 + b02 * a21,
      b00 * a02 + b01 * a12 + b02 * a22,
      b10 * a00 + b11 * a10 + b12 * a20,
      b10 * a01 + b11 * a11 + b12 * a21,
      b10 * a02 + b11 * a12 + b12 * a22,
      b20 * a00 + b21 * a10 + b22 * a20,
      b20 * a01 + b21 * a11 + b22 * a21,
      b20 * a02 + b21 * a12 + b22 * a22,
    ];
  },

  translate: function(m, tx, ty) {
    return m3.multiply(m, m3.translation(tx, ty));
  },

  rotate: function(m, angleInRadians) {
    return m3.multiply(m, m3.rotation(angleInRadians));
  },

  scale: function(m, sx, sy) {
    return m3.multiply(m, m3.scaling(sx, sy));
  },
};