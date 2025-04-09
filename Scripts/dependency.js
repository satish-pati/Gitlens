(function () {
    // Create and style the Analyze Dependencies button
    const dependencyButton = document.createElement("button");
    dependencyButton.innerText = "Analyze Dependencies";
    Object.assign(dependencyButton.style, {
        position: "fixed",
        bottom: "140px",
        right: "20px",
        padding: "12px 18px",
        zIndex: "10000",
        backgroundColor: "#1976D2",
        color: "#fff",
        border: "none",
        borderRadius: "8px",
        fontSize: "14px",
        boxShadow: "0 4px 6px rgba(0,0,0,0.2)",
        cursor: "pointer",
    });
    document.body.appendChild(dependencyButton);

    // Modal container
    const modal = document.createElement("div");
    Object.assign(modal.style, {
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        width: "90%",
        maxWidth: "900px",
        backgroundColor: "#f9f9f9",
        borderRadius: "10px",
        padding: "20px",
        zIndex: "10001",
        boxShadow: "0 6px 24px rgba(0,0,0,0.2)",
        overflowY: "auto",
        maxHeight: "80%",
        display: "none",
        fontFamily: "Arial, sans-serif",
    });

    // Close button
    const closeButton = document.createElement("span");
    closeButton.innerText = "✖";
    Object.assign(closeButton.style, {
        position: "absolute",
        top: "12px",
        right: "18px",
        cursor: "pointer",
        fontSize: "22px",
        color: "#555",
    });
    closeButton.onclick = () => modal.style.display = "none";

    // Content container
    const dependencyContent = document.createElement("div");
    dependencyContent.id = "dependencyContent";
    dependencyContent.style.display = "grid";
    dependencyContent.style.gridTemplateColumns = "1fr 1fr";
    dependencyContent.style.gap = "20px";
    dependencyContent.style.marginTop = "30px";

    modal.appendChild(closeButton);
    modal.appendChild(dependencyContent);
    document.body.appendChild(modal);

    // Show modal and analyze on button click
    dependencyButton.addEventListener("click", async () => {
        modal.style.display = "block";
        dependencyContent.innerHTML = `<p style="grid-column: span 2; font-weight: bold;">🔍 Analyzing dependencies...</p>`;

        let repoData = scrapeRepoDetails();
        if (repoData.error) {
            dependencyContent.innerHTML = `<p>${repoData.error}</p>`;
            return;
        }

        try {
            let response = await fetch("http://localhost:5000/analyze_dependencies", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(repoData),
            });
            let result = await response.json();

            renderDependencyBoxes(result.dependencies);
        } catch (error) {
            dependencyContent.innerHTML = `<p style="color: red;">⚠️ Error: ${error.message}</p>`;
        }
    });

    // Render data as cards/boxes
    function renderDependencyBoxes(rawText) {
        dependencyContent.innerHTML = "";

        let sections = rawText.split("----").map(s => s.trim()).filter(Boolean);
        sections.forEach((sectionText, index) => {
            let title = index === 0 ? "🧩 Functions and Their Dependencies" : "🏛️ Classes and Their Dependencies";
            const section = document.createElement("div");
            section.style.gridColumn = "span 2";

            const heading = document.createElement("h2");
            heading.innerText = title;
            heading.style.marginBottom = "10px";
            section.appendChild(heading);

            const lines = sectionText.split("\n").slice(1);
            const boxContainer = document.createElement("div");
            boxContainer.style.display = "flex";
            boxContainer.style.flexWrap = "wrap";
            boxContainer.style.gap = "15px";

            lines.forEach(line => {
                if (!line.includes("→")) return;
                const [left, right] = line.split("→").map(s => s.trim());

                const card = document.createElement("div");
                Object.assign(card.style, {
                    border: "1px solid #ccc",
                    borderRadius: "8px",
                    padding: "12px 16px",
                    backgroundColor: "#fff",
                    minWidth: "200px",
                    maxWidth: "100%",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                });

                const name = document.createElement("div");
                name.innerHTML = `<strong>${left}</strong>`;
                const deps = document.createElement("div");
                deps.style.fontSize = "13px";
                deps.style.marginTop = "6px";
                deps.innerHTML = `<span style="color:#555;">Depends on:</span><br>${right.split(",").map(d => `• ${d.trim()}`).join("<br>")}`;

                card.appendChild(name);
                card.appendChild(deps);
                boxContainer.appendChild(card);
            });

            section.appendChild(boxContainer);
            dependencyContent.appendChild(section);
        });
    }

    // Extract repository details
    function scrapeRepoDetails() {
        if (!document.location.hostname.includes("github.com")) {
            return { error: "❌ This is not a GitHub repository page." };
        }

        const repoNameElem = document.querySelector('strong[itemprop="name"] a');
        const descElem = document.querySelector('meta[name="description"]');

        return {
            name: repoNameElem?.innerText.trim() || "Unknown Repo",
            description: descElem?.content.trim() || "No description available.",
            fullText: document.body.innerText,
        };
    }
})();
