import { CollectionUtils } from "../utilities/collection-utils";
import { Record } from "immutable";
import { ResultErrorRecord } from "./result-error-record";
import { Result } from "../interfaces/result";
import { ErrorType } from "../enumerations/error-type";

const defaultValues: Result<any> = {
    errors: undefined,
    resultObject: undefined,
};

class ResultRecord<T> extends Record(defaultValues) implements Result<T> {
    // Do NOT set properties on immutable records due to babel and typescript transpilation issue
    // See https://github.com/facebook/create-react-app/issues/6506

    // -----------------------------------------------------------------------------------------
    // #region Constructor
    // -----------------------------------------------------------------------------------------

    constructor(params?: Result<T>) {
        if (params == null) {
            params = {};
        }

        if (CollectionUtils.hasValues(params.errors)) {
            const errors = params.errors as any[];
            params.errors = errors.map((error) =>
                error instanceof ResultErrorRecord
                    ? error
                    : new ResultErrorRecord(error)
            );
        }

        super(params);
    }

    // #endregion Constructor

    // -----------------------------------------------------------------------------------------
    // #region Public Methods
    // -----------------------------------------------------------------------------------------

    /**
     * Adds a new error with the supplied details and returns a new ResultRecord
     * @param key error key value (typically property name)
     * @param message error message value
     * @param type type of error (default of 'Error')
     */
    public addError(key: string, message: string): ResultRecord<T> {
        return this._addErrorByType(key, message, ErrorType.Error);
    }

    /**
     * Adds a new validation error with the supplied details and returns a new ResultRecord
     * @param key error key value (typically property name)
     * @param message error message value
     * @param type type of error (default of 'Error')
     */
    public addValidationError(key: string, message: string): ResultRecord<T> {
        return this._addErrorByType(key, message, ErrorType.ValidationError);
    }

    /**
     * Returns total number of errors
     */
    public errorCount(): number {
        if (this.errors == null) {
            return 0;
        }

        return CollectionUtils.hasValues(this.errors) ? this.errors.length : 0;
    }

    /**
     * Determines if the result contains an error for the supplied key
     * @param key error key for which to search
     */
    public hasErrorFor(key: string): boolean {
        if (this.errors == null || !this.hasErrors()) {
            return false;
        }

        return this.errors.some((e) => e.key === key);
    }

    /**
     * Evaluates whether there are any errors on the result
     */
    public hasErrors(): boolean {
        return CollectionUtils.hasValues(this.errors);
    }

    /**
     * Map all errors into simple string array
     */
    public listErrors(): string[] {
        if (!this.hasErrors()) {
            return [];
        }
        const errors = this.errors as ResultErrorRecord[];
        return errors.map((e) => e.fullError());
    }

    /**
     * Map all error messages into a simple string array.
     */
    public listErrorMessages(): string[] {
        if (!this.hasErrors()) {
            return [];
        }
        const errors = this.errors as ResultErrorRecord[];
        return errors
            .map((e) => String(e.message) || "")
            .filter((e) => e !== "");
    }

    /**
     * Merges new values into the record and returns a new instance.
     *
     * @param {Partial<Result<T>>} values
     * @returns {ResultRecord}
     * @memberof ResultRecord
     */
    public with(values: Partial<Result<T>>): ResultRecord<T> {
        return new ResultRecord<T>(Object.assign(this.toJS(), values));
    }

    // #endregion Public Methods

    // -----------------------------------------------------------------------------------------
    // #region Private Methods
    // -----------------------------------------------------------------------------------------

    private _addErrorByType(
        key: string,
        message: string,
        errorType: ErrorType
    ): ResultRecord<T> {
        const result = this.errors != null ? this.errors : [];

        result.push(
            new ResultErrorRecord({
                key: key,
                message: message,
                type: errorType,
            })
        );

        return this.with({ errors: result });
    }

    // #endregion Private Methods
}

// -----------------------------------------------------------------------------------------
// #region Export
// -----------------------------------------------------------------------------------------

export { ResultRecord };

// #endregion Export
