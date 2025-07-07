# 🛠️ Przewodnik Administratora - EV Akcesoria

## 📋 Spis treści
1. [Pierwszy logowanie jako admin](#pierwszy-logowanie)
2. [Dostęp do panelu administracyjnego](#dostęp-do-panelu)
3. [Dodawanie produktów](#dodawanie-produktów)
4. [Upload zdjęć](#upload-zdjęć)
5. [Zarządzanie zamówieniami](#zarządzanie-zamówieniami)
6. [Dashboard i statystyki](#dashboard)

---

## 🔐 Pierwszy logowanie jako admin {#pierwszy-logowanie}

### **Krok 1: Skonfiguruj swój email jako admin**

1. Otwórz plik `src/App.js`
2. Znajdź linię 1127 (około):
   ```javascript
   const adminEmails = ['admin@evshop.com']; // Dodaj swój email tutaj
   ```
3. Zmień na swój email:
   ```javascript
   const adminEmails = ['twoj-email@gmail.com']; // Wstaw SWÓJ email
   ```
4. Zapisz plik

### **Krok 2: Zarejestruj się i zaloguj**

1. Uruchom aplikację: `npm start`
2. Przejdź na stronę główną
3. Kliknij na ikonę użytkownika w prawym górnym rogu
4. Wybierz **"Zarejestruj się"**
5. Wpisz swój email (ten sam co w kodzie) i hasło
6. Po rejestracji zaloguj się używając tych samych danych

---

## 🎛️ Dostęp do panelu administracyjnego {#dostęp-do-panelu}

### **Sposób 1: Przez menu użytkownika**
1. Po zalogowaniu, kliknij na ikonę użytkownika
2. W rozwijanym menu zobaczysz **"Panel Admina"**
3. Kliknij na niego

### **Sposób 2: Bezpośredni link**
- W kodzie aplikacji: `navigate('admin')`

---

## 🛍️ Dodawanie produktów {#dodawanie-produktów}

### **Przejdź do sekcji produktów**
1. W panelu admina kliknij **"Produkty"** w menu bocznym
2. Kliknij przycisk **"Dodaj produkt"**

### **Wypełnij formularz produktu**

#### **Wymagane pola:**
- **Nazwa produktu** - np. "Ładowarka Tesla Model 3"
- **Cena** - podaj w złotówkach, np. 599.99
- **Kategoria** - wybierz z listy:
  - Ładowarki
  - Akcesoria wnętrza
  - Akcesoria zewnętrzne
  - Części zamienne
  - Elektronika

#### **Opcjonalne pola:**
- **Marka** - np. "Tesla", "Xiaomi", "Baseus"
- **Opis** - szczegółowy opis produktu
- **Bestseller** - zaznacz jeśli produkt ma być wyróżniony
- **Zdjęcia** - dodaj minimum jedno zdjęcie

### **Przykład produktu:**
```
Nazwa: Ładowarka domowa Tesla Wall Connector
Cena: 2499.99
Kategoria: Ładowarki
Marka: Tesla
Opis: Szybka ładowarka domowa o mocy 11kW z Wi-Fi...
Bestseller: ✓
```

---

## 📸 Upload zdjęć {#upload-zdjęć}

### **Jak dodać zdjęcia do produktu:**

1. W formularzu produktu znajdź sekcję **"Zdjęcia"**
2. Kliknij **"Choose File"** (Wybierz plik)
3. Wybierz zdjęcie z komputera
4. Poczekaj na upload (pojawi się komunikat "Przesyłanie...")
5. Po uploaderze zdjęcie pojawi się w podglądzie
6. Możesz dodać więcej zdjęć powtarzając kroki 2-5

### **Wymagania dla zdjęć:**
- **Format:** JPG, PNG, WebP
- **Rozmiar:** Do 10MB
- **Proporcje:** Najlepiej kwadratowe (1:1) lub 4:3
- **Jakość:** Wysokie rozdzielczości dla lepszego wyglądu

### **Gdzie są przechowywane zdjęcia:**
- Zdjęcia są automatycznie przesyłane do **Firebase Storage**
- Otrzymują unikalne nazwy z timestamp
- Są dostępne przez publiczne URL

---

## 📦 Zarządzanie zamówieniami {#zarządzanie-zamówieniami}

### **Przejdź do sekcji zamówień:**
1. W panelu admina kliknij **"Zamówienia"**
2. Zobaczysz listę wszystkich zamówień

### **Informacje o zamówieniu:**
- **ID zamówienia** - unikalny identyfikator
- **Klient** - email zamawiającego
- **Data** - kiedy zostało złożone
- **Suma** - całkowita wartość zamówienia
- **Status** - aktualny stan realizacji

### **Zmiana statusu zamówienia:**
1. W kolumnie "Status" kliknij na rozwijane menu
2. Wybierz nowy status:
   - **Nowe** - świeżo złożone
   - **W trakcie realizacji** - przetwarzane
   - **Wysłane** - w drodze do klienta
   - **Zakończone** - dostarczone
   - **Anulowane** - anulowane

---

## 📊 Dashboard i statystyki {#dashboard}

### **Przegląd główny:**
W sekcji **"Dashboard"** znajdziesz:

1. **Całkowita liczba zamówień**
   - Ile zamówień zostało złożonych łącznie

2. **Całkowity przychód**
   - Suma wszystkich zakończonych zamówień w złotówkach

3. **Liczba produktów**
   - Ile produktów masz w ofercie

### **Przykład dashboardu:**
```
📦 Zamówienia: 45
💰 Przychód: 12,580.50 zł
🛍️ Produkty: 28
```

---

## 🔧 Dodatkowe funkcje

### **Edycja produktu:**
1. W liście produktów kliknij **"Edytuj"**
2. Zmień potrzebne informacje
3. Kliknij **"Zapisz"**

### **Usuwanie produktu:**
1. W liście produktów kliknij **"Usuń"**
2. Potwierdź usunięcie w oknie dialogowym
3. Produkt zostanie trwale usunięty

### **Dodawanie bestsellerów:**
1. Zaznacz opcję **"Bestseller"** przy dodawaniu/edycji produktu
2. Produkt pojawi się w sekcji "Nasze Bestsellery" na stronie głównej

---

## 🚨 Rozwiązywanie problemów

### **Nie widzę "Panel Admina" w menu:**
- Sprawdź czy Twój email jest dodany do `adminEmails` w kodzie
- Wyloguj się i zaloguj ponownie

### **Błąd uploadu zdjęcia:**
- Sprawdź czy Firebase Storage jest włączony
- Sprawdź czy plik nie jest za duży (max 10MB)

### **Błąd zapisywania produktu:**
- Sprawdź czy Firebase Firestore ma poprawne reguły bezpieczeństwa
- Sprawdź czy wszystkie wymagane pola są wypełnione

### **Nie ładują się produkty:**
- Sprawdź konsole przeglądarki (F12) pod kątem błędów
- Sprawdź reguły Firebase Firestore

---

## 📝 Checklist pierwszego produktu

- [ ] Skonfigurowany email admina w kodzie
- [ ] Zalogowany jako admin  
- [ ] Wypełniona nazwa produktu
- [ ] Ustawiona cena
- [ ] Wybrana kategoria
- [ ] Dodane minimum jedno zdjęcie
- [ ] Zapisany produkt
- [ ] Produkt widoczny na stronie głównej

---

**🎉 Gotowe! Twój sklep EV Akcesoria jest gotowy do działania!**