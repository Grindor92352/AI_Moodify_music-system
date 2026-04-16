async function test() {
    try {
        const testImg = "data:image/jpeg;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";
        const res = await fetch("http://localhost:5000/api/music/analyze", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ image: testImg })
        });
        const data = await res.json();
        if (res.ok) {
            console.log("SUCCESS:", data);
        } else {
            console.error("FAILED HTTP STATUS:", res.status);
            console.error("RESPONSE BODY:", data);
        }
    } catch (e) {
        console.error("FETCH ERROR:", e.message);
    }
}
test();
