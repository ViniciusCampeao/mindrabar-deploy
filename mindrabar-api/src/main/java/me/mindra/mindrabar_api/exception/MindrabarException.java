package me.mindra.mindrabar_api.exception;

public class MindrabarException extends RuntimeException {
    
    private final ErrorCode errorCode;
    private final Object[] args;
    
    public MindrabarException(ErrorCode errorCode) {
        super(errorCode.getDefaultMessage());
        this.errorCode = errorCode;
        this.args = new Object[0];
    }

    public MindrabarException(ErrorCode errorCode, String message) {
        super(message);
        this.errorCode = errorCode;
        this.args = new Object[0];
    }

    public MindrabarException(ErrorCode errorCode, String message, Throwable cause) {
        super(message, cause);
        this.errorCode = errorCode;
        this.args = new Object[0];
    }

    public MindrabarException(ErrorCode errorCode, Object... args) {
        super(String.format(errorCode.getDefaultMessage(), args));
        this.errorCode = errorCode;
        this.args = args;
    }

    public ErrorCode getErrorCode() {
        return errorCode;
    }

    public int getNumericCode() {
        return errorCode.getCode();
    }
    
    public ErrorCode.ErrorCategory getCategory() {
        return errorCode.getCategory();
    }

    public Object[] getArgs() {
        return args;
    }
}