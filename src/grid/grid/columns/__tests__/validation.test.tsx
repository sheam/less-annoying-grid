import * as validate from '../validation';
import { fdate } from '../../util';

it('validates a number: with no errors', () => {
    const model = { num: 5, name: 'samuel' };
    const validator = validate.validator(validate.min(5), validate.max(10));
    const errors = validator(model, 'num');
    expect(errors?.length).toBe(0);
});

it('validates a number: too small', () => {
    const model = { num: 3, name: 'samuel' };
    const validator = validate.validator(validate.min(5), validate.max(10));
    const errors = validator(model, 'num');
    expect(errors?.length).toBe(1);
    expect(errors[0].field).toBe('num');
    expect(errors[0].error).toContain(`min ${5}`);
});

it('validates a number: too big', () => {
    const model = { num: 11, name: 'samuel' };
    const validator = validate.validator(validate.min(5), validate.max(10));
    const errors = validator(model, 'num');
    expect(errors?.length).toBe(1);
    expect(errors[0].field).toBe('num');
    expect(errors[0].error).toContain(`max ${10}`);
});

it('validates a number: be required', () => {
    const model = { num: null, name: 'samuel' };
    const validator = validate.validator(
        validate.min(5),
        validate.max(10),
        validate.required()
    );
    const errors = validator(model, 'num');
    expect(errors?.length).toBe(1);
    expect(errors[0].field).toBe('num');
    expect(errors[0].error).toContain(`required`);
});

it('validates a number: be required when value is falsey', () => {
    const model = { num: 0, name: 'samuel' };
    const validator = validate.validator(validate.required());
    const errors = validator(model, 'num');
    expect(errors?.length).toBe(0);
});

it('validates a boolean: be required when value is falsey', () => {
    const model = { num: 0, name: 'samuel', yesno: false };
    const validator = validate.validator(validate.required());
    const errors = validator(model, 'yesno');
    expect(errors?.length).toBe(0);
});

it('validates a boolean: be required when value is truthey', () => {
    const model = { num: 0, name: 'samuel', yesno: true };
    const validator = validate.validator(validate.required());
    const errors = validator(model, 'yesno');
    expect(errors?.length).toBe(0);
});

it('validates a boolean: be required when value is null', () => {
    const model = { num: 0, name: 'samuel', yesno: null };
    const validator = validate.validator(validate.required());
    const errors = validator(model, 'yesno');
    expect(errors?.length).toBe(1);
});

it('validates a boolean: be required when value is undefined', () => {
    const model = { num: 0, name: 'samuel' };
    const validator = validate.validator(validate.required());
    const errors = validator(model, 'yesno');
    expect(errors?.length).toBe(1);
});

it('validates a string: too long', () => {
    const model = { num: 11, name: 'samuel' };
    const validator = validate.validator(
        validate.maxLen(4),
        validate.minLen(2),
        validate.required()
    );
    const errors = validator(model, 'name');
    expect(errors?.length).toBe(1);
    expect(errors[0].field).toBe('name');
    expect(errors[0].error).toContain(`max length ${4}`);
});

it('validates a string: too short', () => {
    const model = { num: null, name: 'samuel' };
    const validator = validate.validator(
        validate.maxLen(100),
        validate.minLen(20),
        validate.required()
    );
    const errors = validator(model, 'name');
    expect(errors?.length).toBe(1);
    expect(errors[0].field).toBe('name');
    expect(errors[0].error).toContain(`min length ${20}`);
});

it('validates a date: before date', () => {
    const model = {
        num: 11,
        name: 'samuel',
        day: new Date('2020-06-01T12:00:00Z'),
    };
    const validationDate = new Date('2020-01-01T12:00:00Z');
    const validator = validate.validator(validate.before(validationDate));
    const errors = validator(model, 'day');
    expect(errors?.length).toBe(1);
    expect(errors[0].field).toBe('day');
    expect(errors[0].error).toContain(`max ${fdate(validationDate)}`);
});

it('validates a date: after date', () => {
    const model = {
        num: 11,
        name: 'samuel',
        day: new Date('2020-02-01T12:00:00Z'),
    };
    const validationDate = new Date('2020-06-01T12:00:00Z');
    const validator = validate.validator(validate.after(validationDate));
    const errors = validator(model, 'day');
    expect(errors?.length).toBe(1);
    expect(errors[0].field).toBe('day');
    expect(errors[0].error).toContain(`min ${fdate(validationDate)}`);
});
