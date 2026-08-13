package me.mindra.mindrabar_api;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import jakarta.annotation.PostConstruct;
import java.util.TimeZone;

@SpringBootApplication
public class MindrabarApiApplication {

	public static void main(String[] args) {
		SpringApplication.run(MindrabarApiApplication.class, args);
	}
	
	@PostConstruct
	public void init() {
		TimeZone.setDefault(TimeZone.getTimeZone("America/Sao_Paulo"));
	}

}
