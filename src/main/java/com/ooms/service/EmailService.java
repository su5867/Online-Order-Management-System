package com.ooms.service;

import com.ooms.entity.Order;
import com.ooms.entity.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    public void sendOrderConfirmation(User user, Order order) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(user.getEmail());
        message.setSubject("Order Confirmation - OOMS");
        message.setText("Dear " + user.getName() + ",\n\nYour order #" + order.getId() + " has been placed successfully.\nTotal Amount: " + order.getTotalAmount() + "\n\nThank you for shopping with us!");
        mailSender.send(message);
    }

    public void sendOrderStatusUpdate(User user, Order order) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(user.getEmail());
        message.setSubject("Order Status Update - OOMS");
        message.setText("Dear " + user.getName() + ",\n\nYour order #" + order.getId() + " status has been updated to: " + order.getStatus() + "\n\nThank you!");
        mailSender.send(message);
    }

    public void sendPaymentConfirmation(User user, Order order) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(user.getEmail());
        message.setSubject("Payment Confirmation - OOMS");
        message.setText("Dear " + user.getName() + ",\n\nPayment for order #" + order.getId() + " has been received successfully.\n\nThank you!");
        mailSender.send(message);
    }
}
