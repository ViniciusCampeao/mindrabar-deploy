package me.mindra.mindrabar_api.domain.service;

import java.util.List;

import me.mindra.mindrabar_api.domain.model.customer.TableSession;
import me.mindra.mindrabar_api.domain.model.customer.TableSessionStatus;
import me.mindra.mindrabar_api.domain.model.table.Table;
import me.mindra.mindrabar_api.domain.model.user.User;
import me.mindra.mindrabar_api.domain.repository.TableSessionRepository;
import me.mindra.mindrabar_api.exception.ErrorCode;
import me.mindra.mindrabar_api.exception.MindrabarException;

public class TableSessionService {

    private final TableSessionRepository tableSessionRepository;

    public TableSessionService(TableSessionRepository tableSessionRepository) {
        this.tableSessionRepository = tableSessionRepository;
    }

    public TableSession create(TableSession tableSession) {
        if (tableSession == null) {
            throw new MindrabarException(ErrorCode.REQUIRED_FIELD, "Sessão de mesa não pode ser nula");
        }
        return tableSessionRepository.save(tableSession);
    }

    public TableSession findById(Long id) {
        if (id == null) {
            throw new MindrabarException(ErrorCode.REQUIRED_FIELD, "ID da sessão não pode ser nulo");
        }
        return tableSessionRepository.findById(id)
            .orElseThrow(() -> new MindrabarException(ErrorCode.TABLE_SESSION_NOT_FOUND, "Sessão de mesa não encontrada"));
    }

    public TableSession findByToken(String sessionToken) {
        if (sessionToken == null) {
            throw new MindrabarException(ErrorCode.REQUIRED_FIELD, "Token da sessão não pode ser nulo");
        }
        return tableSessionRepository.findBySessionToken(sessionToken)
            .orElseThrow(() -> new MindrabarException(ErrorCode.TABLE_SESSION_NOT_FOUND, "Sessão de mesa não encontrada"));
    }

    public TableSession confirm(Long sessionId, User staff) {
        TableSession tableSession = findById(sessionId);
        tableSession.confirm(staff);
        return tableSessionRepository.save(tableSession);
    }

    public void closeByTable(Table table) {
        List<TableSession> sessions = tableSessionRepository.findByTable(table);
        for (TableSession session : sessions) {
            if (session.getStatus() != TableSessionStatus.CLOSED) {
                session.close();
                tableSessionRepository.save(session);
            }
        }
    }

    public List<TableSession> findPendingByCompanyId(Long companyId) {
        return tableSessionRepository.findByStatusAndCompanyId(TableSessionStatus.PENDING_CONFIRMATION, companyId);
    }

    public long countPendingByCompanyId(Long companyId) {
        return tableSessionRepository.countByStatusAndCompanyId(TableSessionStatus.PENDING_CONFIRMATION, companyId);
    }
}
