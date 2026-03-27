package com.education.udemy.service;

import com.education.udemy.configuration.VNPayConfig;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Map;
import java.util.TreeMap;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class VNPayService {

    private final VNPayConfig vnPayConfig;

    public String createPaymentUrl(String orderCode, long amountVnd, String ipAddr) throws Exception {
        Map<String, String> vnpParams = new TreeMap<>();
        vnpParams.put("vnp_Version", "2.1.0");
        vnpParams.put("vnp_Command", "pay");
        vnpParams.put("vnp_TmnCode", vnPayConfig.getTmnCode());
        vnpParams.put("vnp_Amount", String.valueOf(amountVnd * 100));
        vnpParams.put("vnp_CurrCode", "VND");
        vnpParams.put("vnp_TxnRef", orderCode);
        vnpParams.put("vnp_OrderInfo", "Thanh toan don hang " + orderCode);
        vnpParams.put("vnp_OrderType", "other");
        vnpParams.put("vnp_Locale", "vn");
        vnpParams.put("vnp_ReturnUrl", vnPayConfig.getReturnUrl());
        vnpParams.put("vnp_IpAddr", ipAddr);
        vnpParams.put("vnp_CreateDate", new SimpleDateFormat("yyyyMMddHHmmss").format(new Date()));

        StringBuilder query = new StringBuilder();
        StringBuilder hashData = new StringBuilder();

        for (Map.Entry<String, String> entry : vnpParams.entrySet()) {
            String key = entry.getKey();
            String encodedValue = URLEncoder.encode(entry.getValue(), StandardCharsets.US_ASCII);

            query.append(URLEncoder.encode(key, StandardCharsets.US_ASCII))
                    .append("=")
                    .append(encodedValue)
                    .append("&");

            hashData.append(key)
                    .append("=")
                    .append(encodedValue)
                    .append("&");
        }

        String queryString = query.substring(0, query.length() - 1);
        String hashDataString = hashData.substring(0, hashData.length() - 1);

        String secureHash = hmacSHA512(vnPayConfig.getHashSecret(), hashDataString);

        return vnPayConfig.getUrl() + "?" + queryString + "&vnp_SecureHash=" + secureHash;
    }

    public boolean verifyReturn(Map<String, String> params) throws Exception {
        String receivedHash = params.get("vnp_SecureHash");
        if (receivedHash == null) {
            return false;
        }

        Map<String, String> filteredParams = new TreeMap<>(params);
        filteredParams.remove("vnp_SecureHash");
        filteredParams.remove("vnp_SecureHashType");

        StringBuilder hashData = new StringBuilder();
        for (Map.Entry<String, String> entry : filteredParams.entrySet()) {
            String encodedValue = URLEncoder.encode(entry.getValue(), StandardCharsets.US_ASCII);
            hashData.append(entry.getKey())
                    .append("=")
                    .append(encodedValue)
                    .append("&");
        }

        String hashDataString = hashData.substring(0, hashData.length() - 1);
        String expectedHash = hmacSHA512(vnPayConfig.getHashSecret(), hashDataString);

        return expectedHash.equalsIgnoreCase(receivedHash);
    }

    private String hmacSHA512(String key, String data) throws Exception {
        Mac mac = Mac.getInstance("HmacSHA512");
        SecretKeySpec secretKeySpec = new SecretKeySpec(key.getBytes(StandardCharsets.UTF_8), "HmacSHA512");
        mac.init(secretKeySpec);

        byte[] bytes = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));

        StringBuilder sb = new StringBuilder();
        for (byte b : bytes) {
            sb.append(String.format("%02x", b));
        }
        return sb.toString();
    }
}