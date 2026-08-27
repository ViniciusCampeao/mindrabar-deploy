package me.mindra.mindrabar_api.domain.model.customer;

public class PhoneUtils {

    private PhoneUtils() {
    }

    public static String normalize(String phone) {
        if (phone == null) {
            return null;
        }
        return phone.replaceAll("\\D", "");
    }

    public static boolean isValidBrazilianPhone(String digitsOnly) {
        if (digitsOnly == null) {
            return false;
        }
        if (digitsOnly.length() != 10 && digitsOnly.length() != 11) {
            return false;
        }
        int ddd = Integer.parseInt(digitsOnly.substring(0, 2));
        if (ddd < 11 || ddd > 99) {
            return false;
        }
        if (digitsOnly.length() == 11 && digitsOnly.charAt(2) != '9') {
            return false;
        }
        return true;
    }
}
