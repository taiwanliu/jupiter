'strict mode';
module.exports = class Response {
    constructor() {
        this.errCode = '';
        this.errMsg = '';
        this.errDetail = '';
    }

    success() {
        this.errCode = '00';
        return this;
    }

    invalidRequest(errDetail) {
        this.errCode = '101';
        this.errMsg = 'Invalid Request';
        if (errDetail) this.errDetail = errDetail;
        return this;
    }

    internalServerError(errDetail) {
        this.errCode = '102';
        this.errMsg = 'Internal Server Error';
        if (errDetail) this.errDetail = errDetail;
        return this;
    }

}