package me.mindra.mindrabar_api.domain.service;

import java.util.List;

import me.mindra.mindrabar_api.domain.model.user.User;
import me.mindra.mindrabar_api.domain.repository.UserRepository;
import me.mindra.mindrabar_api.exception.ErrorCode;
import me.mindra.mindrabar_api.exception.MindrabarException;

public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public User create(User user) {
        if(user.getCompany() == null) {
            throw new MindrabarException(ErrorCode.REQUIRED_FIELD, "Usuário deve pertencer a uma Empresa");
        }    
        return userRepository.save(user);
    }

    public User findById(Long id) {
        return userRepository.findById(id).orElseThrow(() -> new MindrabarException(ErrorCode.USER_NOT_FOUND, "Usuário não encontrado"));
    }

    public User findByUsername(String username) {
       return userRepository.findByUsername(username).orElseThrow(() -> new MindrabarException(ErrorCode.USER_NOT_FOUND, "Usuário não encontrado"));
    }

    public User update(User existingUser) {
        return userRepository.save(existingUser);
    }

    public List<User> findByCompanyId(Long companyId) {
        return userRepository.findByCompanyId(companyId);
    }

    public void deleteById(Long userId) {
        userRepository.deleteById(userId);
    }
}
