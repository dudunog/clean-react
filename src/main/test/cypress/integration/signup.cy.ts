import * as FormHelper from '../support/form-helper'
import * as Http from '../support/signup-mocks'
import faker from 'faker'

const populateFields = (): void => {
  cy.getByTestId('name').focus()
  cy.getByTestId('name').type(faker.random.alphaNumeric(7))
  cy.getByTestId('email').focus()
  cy.getByTestId('email').type(faker.internet.email())
  const password = faker.random.alphaNumeric(7)
  cy.getByTestId('password').focus()
  cy.getByTestId('password').type(password)
  cy.getByTestId('passwordConfirmation').focus()
  cy.getByTestId('passwordConfirmation').type(password)
}

const simulateValidSubmit = (): void => {
  populateFields()
  cy.getByTestId('submit').click()
}

describe('SignUp', () => {
  beforeEach(() => {
    cy.visit('signup')
  })

  it('Should load with correct initial state', () => {
    cy.getByTestId('name').should('have.attr', 'readOnly')
    FormHelper.testInputStatus('name', 'Campo obrigatório')
    cy.getByTestId('email').should('have.attr', 'readOnly')
    FormHelper.testInputStatus('email', 'Campo obrigatório')
    cy.getByTestId('password').should('have.attr', 'readOnly')
    FormHelper.testInputStatus('password', 'Campo obrigatório')
    cy.getByTestId('passwordConfirmation').should('have.attr', 'readOnly')
    FormHelper.testInputStatus('passwordConfirmation', 'Campo obrigatório')
    cy.getByTestId('submit').should('have.attr', 'disabled')
    cy.getByTestId('error-wrap').should('not.have.descendants')
  })

  it('Should present error state if form is invalid', () => {
    cy.getByTestId('name').focus()
    cy.getByTestId('name').type(faker.random.alphaNumeric(3))
    FormHelper.testInputStatus('name', 'Valor inválido')
    cy.getByTestId('email').focus()
    cy.getByTestId('email').type(faker.random.word())
    FormHelper.testInputStatus('email', 'Valor inválido')
    cy.getByTestId('password').focus()
    cy.getByTestId('password').type(faker.random.alphaNumeric(3))
    FormHelper.testInputStatus('password', 'Valor inválido')
    cy.getByTestId('passwordConfirmation').focus()
    cy.getByTestId('passwordConfirmation').type(faker.random.alphaNumeric(4))
    FormHelper.testInputStatus('passwordConfirmation', 'Valor inválido')
    cy.getByTestId('submit').should('have.attr', 'disabled')
    cy.getByTestId('error-wrap').should('not.have.descendants')
  })

  it('Should present valid state if form is valid', () => {
    cy.getByTestId('name').focus()
    cy.getByTestId('name').type(faker.random.alphaNumeric(7))
    FormHelper.testInputStatus('name')
    cy.getByTestId('email').focus()
    cy.getByTestId('email').type(faker.internet.email())
    FormHelper.testInputStatus('email')
    const password = faker.random.alphaNumeric(5)
    cy.getByTestId('password').focus()
    cy.getByTestId('password').type(password)
    FormHelper.testInputStatus('password')
    cy.getByTestId('passwordConfirmation').focus()
    cy.getByTestId('passwordConfirmation').type(password)
    FormHelper.testInputStatus('passwordConfirmation')
    cy.getByTestId('submit').should('not.have.attr', 'disabled')
    cy.getByTestId('error-wrap').should('not.have.descendants')
  })

  it('Should present EmailInUseError on 403', () => {
    Http.mockEmailInUseError()
    simulateValidSubmit()
    FormHelper.testMainError('Esse e-mail já está em uso')
    FormHelper.testUrl('/signup')
  })

  it('Should present UnexpectedError on default error cases', () => {
    Http.mockUnexpectedError()
    simulateValidSubmit()
    FormHelper.testMainError('Algo de errado aconteceu. Tente novamente em breve.')
    cy.getByTestId('spinner').should('not.exist')
    FormHelper.testUrl('/signup')
  })

  it('Should present UnexpectedError if invalid data is returned', () => {
    Http.mockInvalidData()
    simulateValidSubmit()
    FormHelper.testMainError('Algo de errado aconteceu. Tente novamente em breve.')
    FormHelper.testUrl('/signup')
  })

  it('Should save accessToken if valid credentials are provided', () => {
    Http.mockOk()
    simulateValidSubmit()
    cy.getByTestId('error-wrap').should('not.exist')
    FormHelper.testUrl('/')
    FormHelper.testLocalStorageItem('accessToken')
  })

  it('Should prevent multiple submits', () => {
    Http.mockOk()
    populateFields()
    cy.getByTestId('submit').dblclick()
    FormHelper.testHttpCallsCount(1)
  })

  it('Should not call submits if form is invalid', () => {
    Http.mockOk()
    cy.getByTestId('email').focus()
    cy.getByTestId('email').type(faker.internet.email())
    cy.getByTestId('email').type('{enter}')
    FormHelper.testHttpCallsCount(0)
  })
})
