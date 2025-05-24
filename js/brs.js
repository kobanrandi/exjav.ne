window.pJGQYAfPSq = function() {
    return detectAdBlock() || detectAdGuard();
};

function detectAdBlock() {
    const detect = document.querySelector("#ad_detect_2025");
    if (!detect) return false;

    let adClasses = ["ad", "ads", "ad-placement", "ad-placeholder", "adbadge", "BannerAd", "advertisment", "ads_div"];
    adClasses.forEach(cls => detect.classList.add(cls));

    return window.getComputedStyle(detect).getPropertyValue("display") === "none";
}

function detectAdGuard() {
    let testDiv = document.createElement("div");
    testDiv.className = "sextb_700";
    testDiv.style.width = "10px";
    testDiv.style.height = "10px";
    testDiv.style.background = "red";
    testDiv.style.position = "fixed";
    testDiv.style.left = "10px";
    testDiv.style.top = "10px";
    document.body.appendChild(testDiv);

    let computedStyle = window.getComputedStyle(testDiv);
    let isBlocked = computedStyle.display === "none" || computedStyle.visibility === "hidden" || computedStyle.position === "absolute" && computedStyle.left === "-9999px";

    testDiv.remove();
    return isBlocked;
}