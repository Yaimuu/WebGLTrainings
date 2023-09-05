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
}