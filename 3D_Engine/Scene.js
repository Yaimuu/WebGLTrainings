class Scene {

    constructor(gl) {
        this.gl = gl;
        this.objects = [];

        this.projection = {
            fieldOfView: 60,
            aspect: gl.canvas.clientWidth / gl.canvas.clientHeight,
            znear: 1,
            zFar: 2000,
        };

        let fieldOfViewRadians = this.fieldOfView * (Math.PI/180);

        this.projectionMatrix = m4.perspective(fieldOfViewRadians, this.projection.aspect, this.projection.zNear, this.projection.zFar);
        this.projectionMatrix = m4.multiply(this.projectionMatrix, m4.projection(gl.canvas.clientWidth, gl.canvas.clientHeight, 400));
        // this.projectionMatrix = m4.translate(this.projectionMatrix, translation.x, translation.y, translation.z);

        
    }

    initScene() {

    }

    drawScene() {

    }
}