package com.education.udemy.dto.request.order;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public class SePayWebhookRequest {

    private Long id;
    private String gateway;

    @JsonProperty("transactionDate")
    private String transactionDate;

    @JsonProperty("accountNumber")
    private String accountNumber;

    private String content;

    @JsonProperty("transferAmount")
    private BigDecimal transferAmount;

    @JsonProperty("transferType")
    private String transferType;

    @JsonProperty("referenceCode")
    private String referenceCode;

    private String description;
}