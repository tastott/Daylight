import chai = require('chai')
var expect = chai.expect;

import app = require('../app')

describe('Example app tests', () => {
	it('Should say Hello from daylight!', () => {
		expect(app.GetMessage()).to.be.equal('Hello from daylight!')
	})
})