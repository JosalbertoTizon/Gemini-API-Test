const pnameForm = document.getElementById("pname_form");
const responseContainer = document.getElementsByClassName("response_container")[0];

pnameForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    pname = formData.get("pname_box");
    
    const url = "https:/pokeapi.co/api/v2/pokemon/" + pname
    response = await fetchBackendRequest(url);
    responseContainer.textContent = response;
})

fetchBackendRequest = async url => {
    try {
        const response = await fetch("http://127.0.0.1:8000", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                api_url: url
            }),
        });
        const data = await response.text();
        return data;
    } catch (error) {
        return console.log(error);
    }
}