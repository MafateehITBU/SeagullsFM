export const formatTextWithSpecialChars = (text) => {
    if (!text) return '';
    const parts = [];
    let currentPart = '';
    let keyIndex = 0;

    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        if (char === '&' || char === '-' || char === "'" || char === '’' || char === '‘' || char === '”' || char === '“' || char === '4') {
            if (currentPart) {
                parts.push(currentPart);
                currentPart = '';
            }
            parts.push(
                <span key={`special-${keyIndex++}`} className="ampersand-fallback">
                    {char}
                </span>
            );
        } else {
            currentPart += char;
        }
    }

    if (currentPart) {
        parts.push(currentPart);
    }

    return parts.length > 0 ? parts : text;
}
