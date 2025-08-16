<template>
  <div class="page-layout">
    <div class="page-container">
      <slot />
    </div>
  </div>
</template>

<style scoped>
.page-layout {
  width: 100%;
  min-height: calc(100vh - 140px); /* Account for header */
  background: #f7fafc;
}

.page-container {
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  padding: 1rem;
}

/* Tablet */
@media (min-width: 768px) {
  .page-container {
    padding: 1.5rem 2rem;
  }
}

/* Desktop */
@media (min-width: 1024px) {
  .page-container {
    padding: 2rem 3rem;
  }
}

/* Large Desktop */
@media (min-width: 1440px) {
  .page-container {
    padding: 2.5rem 4rem;
  }
}
</style>
