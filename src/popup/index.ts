import '../app.css';
import Wrapper from '../components/Wrapper.svelte';

const target = document.getElementById('app');

async function render() {
  new Wrapper({target});
}

document.addEventListener('DOMContentLoaded', render);
