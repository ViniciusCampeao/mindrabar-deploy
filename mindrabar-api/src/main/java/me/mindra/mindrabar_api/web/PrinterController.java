package me.mindra.mindrabar_api.web;

import me.mindra.mindrabar_api.domain.service.PrinterService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/print")
public class PrinterController {

    private final PrinterService printerService;

    public PrinterController(PrinterService printerService) {
        this.printerService = printerService;
    }

    @PostMapping
    public ResponseEntity<Void> print(@RequestBody Object payload) {

        System.out.println("/print received: " + payload);
        printerService.sendToPrint(payload);
        System.out.println("request sent to service");
        return ResponseEntity.accepted().build();
    }
}
