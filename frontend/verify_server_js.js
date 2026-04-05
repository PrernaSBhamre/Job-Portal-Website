async function verifyServer() {
    try {
        const response = await fetch('http://localhost:3000/js/home.js');
        const text = await response.text();
        console.log('Includes IT:', text.includes('IT'));
        console.log('Includes FRESHER:', text.includes('FRESHER'));
        console.log('Tags line:', text.split('\n').find(l => l.includes('tags =')));
    } catch (e) {
        console.error(e.message);
    }
}
verifyServer();
