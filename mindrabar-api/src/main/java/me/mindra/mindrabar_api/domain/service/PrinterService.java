package me.mindra.mindrabar_api.domain.service;

import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class PrinterService {

    private final RabbitTemplate rabbitTemplate;

    @Value("${rabbitmq.exchange}")
    private String exchange;

    @Value("${rabbitmq.routing-key}")
    private String routingKey;

    public PrinterService(RabbitTemplate rabbitTemplate) {
        this.rabbitTemplate = rabbitTemplate;
    }

    public void sendToPrint(Object payload) {

        System.out.println("Sending to RabbitMQ...");
        System.out.println("Exchange: " + exchange);
        System.out.println("RoutingKey: " + routingKey);
        System.out.println("Payload: " + payload);

        rabbitTemplate.convertAndSend(exchange, routingKey, payload);
        System.out.println("Sent to RabbitMQ");
    }
}