package com.ooms.service;

import com.ooms.entity.Order;
import com.ooms.entity.Payment;
import com.ooms.entity.PaymentMethod;
import com.ooms.entity.PaymentStatus;
import com.ooms.repository.PaymentRepository;
import com.stripe.Stripe;
import com.stripe.exception.StripeException;
import com.stripe.model.PaymentIntent;
import com.stripe.param.PaymentIntentCreateParams;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class PaymentService {

    @Value("${stripe.secret.key}")
    private String stripeSecretKey;

    @Autowired
    private PaymentRepository paymentRepository;

    public String initiatePayment(Order order, PaymentMethod method) {
        Payment payment = new Payment();
        payment.setOrder(order);
        payment.setAmount(order.getTotalAmount());
        payment.setMethod(method);
        payment.setStatus(PaymentStatus.PENDING);
        paymentRepository.save(payment);

        switch (method) {
            case STRIPE:
                return initiateStripePayment(order);
            case COD:
                payment.setStatus(PaymentStatus.PENDING);
                paymentRepository.save(payment);
                return "cod_confirmed";
            default:
                throw new RuntimeException("Unsupported payment method");
        }
    }

    private String initiateStripePayment(Order order) {
        Stripe.apiKey = stripeSecretKey;

        try {
            PaymentIntentCreateParams params = PaymentIntentCreateParams.builder()
                    .setAmount((long) (order.getTotalAmount() * 100)) // Amount in cents
                    .setCurrency("usd")
                    .setDescription("Order #" + order.getId())
                    .build();

            PaymentIntent paymentIntent = PaymentIntent.create(params);
            return paymentIntent.getClientSecret();
        } catch (StripeException e) {
            throw new RuntimeException("Stripe payment initiation failed: " + e.getMessage());
        }
    }

    public boolean verifyPayment(String transactionId, PaymentMethod method) {
        // TODO: Implement verification logic for Stripe webhooks
        return true;
    }
}
