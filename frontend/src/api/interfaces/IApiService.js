// src/api/interfaces/IApiService.js
export class IApiService {
    async analyzeBill(referenceNumber) { throw new Error('Not implemented'); }
    async getBillDetails(referenceNumber) { throw new Error('Not implemented'); }
    async validateReferenceNumber(referenceNumber) { throw new Error('Not implemented'); }
    async generateQuote(billData) { throw new Error('Not implemented'); }
    async getQuoteById(quoteId) { throw new Error('Not implemented'); }
    async saveQuote(quote) { throw new Error('Not implemented'); }
}
