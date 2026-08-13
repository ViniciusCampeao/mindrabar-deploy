package me.mindra.mindrabar_api.exception;

import java.time.LocalDateTime;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;

import io.swagger.v3.oas.annotations.Hidden;

@Hidden
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(MindrabarException.class)
    public ResponseEntity<ErrorResponse> handleMindrabarException(
            MindrabarException ex, WebRequest request) {
        
        HttpStatus status = mapCategoryToHttpStatus(ex.getCategory());
        
        ErrorResponse errorResponse = new ErrorResponse(
            status.value(),
            ex.getErrorCode().name(),
            ex.getMessage(),
            request.getDescription(false),
            LocalDateTime.now()
        );
        
        return new ResponseEntity<>(errorResponse, status);
    }
    
    @ExceptionHandler(UsernameNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleUsernameNotFoundException(
            UsernameNotFoundException ex, WebRequest request) {
        
        ErrorResponse errorResponse = new ErrorResponse(
            HttpStatus.NOT_FOUND.value(),
            ErrorCode.USER_NOT_FOUND.name(),
            ex.getMessage(),
            request.getDescription(false),
            LocalDateTime.now()
        );
        
        return new ResponseEntity<>(errorResponse, HttpStatus.NOT_FOUND);
    }
    
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGenericException(
            Exception ex, WebRequest request) {
        
        ErrorResponse errorResponse = new ErrorResponse(
            HttpStatus.INTERNAL_SERVER_ERROR.value(),
            ErrorCode.INTERNAL_ERROR.name(),
            "Ocorreu um erro inesperado. Por favor, contate o suporte.",
            request.getDescription(false),
            LocalDateTime.now()
        );
        
        return new ResponseEntity<>(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR);
    }
    
    private HttpStatus mapCategoryToHttpStatus(ErrorCode.ErrorCategory category) {
        return switch (category) {
            case SECURITY -> HttpStatus.FORBIDDEN;
            case NOT_FOUND -> HttpStatus.NOT_FOUND;
            case VALIDATION -> HttpStatus.BAD_REQUEST;
            case BUSINESS -> HttpStatus.UNPROCESSABLE_ENTITY;
            case SYSTEM -> HttpStatus.INTERNAL_SERVER_ERROR;
        };
    }

    public static class ErrorResponse {
        private final int status;
        private final String code;
        private final String message;
        private final String path;
        private final LocalDateTime timestamp;
        
        public ErrorResponse(int status, String code, String message, String path, LocalDateTime timestamp) {
            this.status = status;
            this.code = code;
            this.message = message;
            this.path = path;
            this.timestamp = timestamp;
        }
        
        public int getStatus() {
            return status;
        }
        
        public String getCode() {
            return code;
        }
        
        public String getMessage() {
            return message;
        }
        
        public String getPath() {
            return path;
        }
        
        public LocalDateTime getTimestamp() {
            return timestamp;
        }
    }
}