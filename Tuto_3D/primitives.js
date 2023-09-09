const primitives = {
    primitives_2d: {
        vertex: function(gl, pos) {
            primitives.helper.bufferData(
                gl.ARRAY_BUFFER, 
                new Float32Array(positions), 
                gl.STATIC_DRAW);
            
            return {
                positions: [pos.x, pos.y, pos.z]
            };
        }
    },
    primitives_3d: {

    },
    helper: {
        bufferData: function(gl, srcData, positions, usage) {
            var buffer = gl.createBuffer();
            gl.bindBuffer(srcData, buffer);
            gl.bufferData(srcData, positions, usage);
        }
    }
};