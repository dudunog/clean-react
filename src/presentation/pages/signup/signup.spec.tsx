import React from 'react'
import faker from 'faker'
import { type RenderResult, render, cleanup, fireEvent } from '@testing-library/react'
import Signup from './signup'
import { Helper, ValidationStub } from '@/presentation/test'

type SutType = {
  sut: RenderResult
}

type SutParams = {
  validationError: string
}

const makeSut = (params?: SutParams): SutType => {
  const validationStub = new ValidationStub()
  validationStub.errorMessage = params?.validationError
  const sut = render(
    <Signup
      validation={validationStub}
    />
  )
  return {
    sut
  }
}

const populateField = (
  sut: RenderResult,
  fieldName: string,
  value = faker.random.word()
): void => {
  const input = sut.getByTestId(fieldName)
  fireEvent.input(input, { target: { value } })
}

describe('Signup Component ', () => {
  afterEach(cleanup)

  test('Should start with initial state', () => {
    const validationError = faker.random.words()
    const { sut } = makeSut({ validationError })
    Helper.testChildCount(sut, 'error-wrap', 0)
    Helper.testButtonIsDisabled(sut, 'submit', true)
    Helper.testStatusForField(sut, 'name', validationError)
    Helper.testStatusForField(sut, 'email', 'Campo obrigatório')
    Helper.testStatusForField(sut, 'password', 'Campo obrigatório')
    Helper.testStatusForField(sut, 'passwordConfirmation', 'Campo obrigatório')
  })

  test('Should show name error if Validation fails', () => {
    const validationError = faker.random.words()
    const { sut } = makeSut({ validationError })
    populateField(sut, 'name')
    Helper.testStatusForField(sut, 'name', validationError)
  })
})
