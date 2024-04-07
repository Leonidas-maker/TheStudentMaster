# Test concept documentation

## 1. introduction

This document describes the test concept for testing the frontend with Jest and the backend with FastAPI using static data.

## 2. Test Objects

- **Frontend:** Web application developed in React.
- **Backend:** REST API developed with FastAPI.

## 3. Test Objectives

- Ensure that both frontend and backend work according to specifications.
- Check integration between frontend and backend.

## 4. Test Strategy and Approach

### Frontend tests

- **Tool:** Jest is used to perform component tests.
- **Data:** Static data is used for mocking and as a test fixture.

### Backend tests

- **Tool:** FastAPI test client is used for integration tests.
- **Data:** Static test data is used to test the API endpoints.

## 5. Test Environment

- **Hardware:** Standard PC for development and testing.
- **Software:** Node.js and Python are required.
- **Tools:**
- Jest for frontend tests.
- FastAPI and Pytest for backend tests.

## 6. Test Data

- Static JSON data for frontend tests.
- Static JSON data for backend API tests.

## 7. Resource Planning

- **Test team:** 1 developer of static test data, 1 developer for test files.

## 8 Responsibilities

- **Frontend Tester:** Responsible for the creation and execution of the Jest tests.
- **Backend Tester:** Responsible for the execution of FastAPI tests.

## 9. Error Management

- Bugs are tracked and managed with GitHub Issues.

## 10. Documentation and reporting

- Test results reviewed by the team and stored in a central repository.

## 11. Acceptance Criteria

- All critical bugs must be fixed.
- Test coverage of at least 80% must be achieved.

## 12. Change Management

- Changes to the test concept must be approved by the test team lead.
