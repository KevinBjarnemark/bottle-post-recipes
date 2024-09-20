
export const textInput = (props) => {
    const {key, defaultValue, label} = props;
    return `
        <div class="d-flex flex-column mb-4 text-white">
            <label for="id_${key}">${label}</label>
            <input 
                class="form-control mt-1"
                type="text" 
                placeholder="${label}" 
                name="${key}" 
                id="id_${key}" 
                value="${defaultValue !== null ? defaultValue : ""}"
            />
        </div>
    `
};

export const numberInput = (props) => {
    const {key, defaultValue, label} = props;
    return `
        <div class="d-flex flex-column mb-4 text-white">
            <label for="id_${key}">${label}</label>
            <input 
                class="form-control mt-1"
                type="number" 
                placeholder="${label}" 
                name="${key}" 
                id="id_${key}" 
                value="${defaultValue !== null ? defaultValue : ""}"
            />
        </div>
    `
};

export const textAreaInput = (props) => {
    const {key, defaultValue, label} = props;
    return `
        <div class="d-flex flex-column mt-4 text-white">
            <label for="id_${key}">${label}</label>
            <textarea 
                class="form-control mt-1" 
                style="height: 150px"
                type="text" 
                placeholder="${label}"
                name="${key}" 
                id="id_${key}"
                value="${defaultValue !== null ? defaultValue : ""}">
            </textarea>
        </div>
    `
};

export const fileInput = (props) => {
    const {key, defaultValue, label} = props;
    return `
        <div class="d-flex align-items-start flex-column mt-4">
            <div class="mb-4 text-white">
                <label for="id_${key}">${label}</label>
                <input 
                    class="form-control mt-1" 
                    type="file" 
                    name="${key}" 
                    id="id_${key}"
                />
            </div>
        </div>
    `
};

export const checkboxInput = (props) => {
    const {key, defaultValue, label} = props;
    return `
        <div class="d-flex align-items-start flex-row mb-4">
            <input 
                class="form-check-input"
                style="margin-right: 10px;" 
                type="checkbox" 
                name="${key}" 
                id="id_${key}"
                ${defaultValue ? "checked" : ""}
            />
            <label class="form-check-label text-white" for="id_${key}">${label}</label>
        </div>
    `
};
