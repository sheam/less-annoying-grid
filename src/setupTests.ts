// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';
import { configure } from 'enzyme';
const Adapter = require('@wojtekmaj/enzyme-adapter-react-17');
// const Adapter = require("enzyme-adapter-react-16");

configure({ adapter: new Adapter() });
