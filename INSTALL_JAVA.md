# 🔧 Instalar Java para Maestro

Maestro requiere Java para funcionar. Sigue estos pasos:

---

## Opción 1: Instalar Java con Homebrew (RECOMENDADO)

### 1. Arreglar permisos de Homebrew

Copia y pega este comando en tu terminal:

```bash
sudo chown -R $(whoami) /opt/homebrew
```

Te pedirá tu contraseña de macOS.

### 2. Instalar Java 17

```bash
brew install openjdk@17
```

### 3. Configurar JAVA_HOME

Agrega esto a tu `~/.zshrc`:

```bash
echo 'export JAVA_HOME=/opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk/Contents/Home' >> ~/.zshrc
echo 'export PATH="$JAVA_HOME/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
```

### 4. Verificar instalación

```bash
java -version
```

Deberías ver algo como:
```
openjdk version "17.0.x"
```

---

## Opción 2: Instalar Java manualmente

Si Homebrew sigue sin funcionar:

### 1. Descargar desde Oracle

Visita: https://www.oracle.com/java/technologies/downloads/#jdk17-mac

Descarga el instalador para macOS (ARM si tienes M1/M2/M3, x64 si es Intel).

### 2. Instalar el .dmg

Doble clic en el archivo descargado y sigue el instalador.

### 3. Configurar JAVA_HOME

```bash
echo 'export JAVA_HOME=/Library/Java/JavaVirtualMachines/jdk-17.jdk/Contents/Home' >> ~/.zshrc
echo 'export PATH="$JAVA_HOME/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
```

### 4. Verificar

```bash
java -version
```

---

## Después de instalar Java

### Reiniciar Maestro

```bash
# Si ya lo tenías instalado, reinstala
curl -Ls "https://get.maestro.mobile.dev" | bash
```

### Verificar que funciona

```bash
maestro --version
```

### Ejecutar un test

```bash
npm run test:e2e:login
```

---

## ⚠️ Si aún no funciona

### Verificar variables de entorno

```bash
echo $JAVA_HOME
# Debe mostrar: /opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk/Contents/Home

which java
# Debe mostrar: /opt/homebrew/opt/openjdk@17/bin/java
```

### Reiniciar terminal

Cierra y abre una nueva terminal para que los cambios tomen efecto.

---

## 🎯 Una vez que funcione

Prueba ejecutar:

```bash
# Test simple de login
npm run test:e2e:login

# Todos los tests
npm run test:e2e
```

---

## 📞 Contacto

Si sigues teniendo problemas, revisa:
- `.maestro/README.md` - Documentación de Maestro
- https://maestro.mobile.dev/ - Docs oficiales
