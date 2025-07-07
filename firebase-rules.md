# Reguły Firebase Firestore

Aby aplikacja działała poprawnie, musisz skonfigurować reguły bezpieczeństwa w Firebase Firestore.

## Jak skonfigurować reguły:

1. Przejdź do [Firebase Console](https://console.firebase.google.com)
2. Wybierz swój projekt `evshop-6719a`
3. W menu bocznym wybierz **Firestore Database**
4. Przejdź do zakładki **Rules** (Reguły)
5. Zastąp obecne reguły poniższym kodem:

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    // Produkty - odczyt dla wszystkich, zapis tylko dla adminów
    match /products/{document} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.token.role == 'admin';
      
      // Recenzje produktów
      match /reviews/{reviewId} {
        allow read: if true;
        allow write: if request.auth != null;
      }
    }
    
    // Zamówienia - tylko zalogowani użytkownicy
    match /orders/{document} {
      allow read, write: if request.auth != null;
    }
    
    // Użytkownicy - dostęp tylko do własnych danych
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

6. Kliknij **Publish** (Opublikuj)

## Nadawanie uprawnień administratora:

Aby użytkownik mógł być administratorem, należy nadać mu rolę admin w Firebase Authentication Custom Claims.

### Opcja 1: Za pomocą Firebase Admin SDK (zalecane)
```javascript
const admin = require('firebase-admin');

async function setAdminRole(email) {
  const user = await admin.auth().getUserByEmail(email);
  await admin.auth().setCustomUserClaims(user.uid, { role: 'admin' });
}

// Wywołaj dla swojego emaila:
setAdminRole('twoj-email@example.com');
```

### Opcja 2: Tymczasowe rozwiązanie dla pierwszego admina
W pliku `src/App.js` znajdź linię 1125:
```javascript
setUserRole(tokenResult.claims.role || 'user');
```

Zmień na:
```javascript
// Tymczasowo nadaj uprawnienia admina dla swojego emaila
const adminEmails = ['twoj-email@example.com']; // Dodaj swój email
setUserRole(adminEmails.includes(currentUser.email) ? 'admin' : (tokenResult.claims.role || 'user'));
```