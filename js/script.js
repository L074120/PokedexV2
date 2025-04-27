const typeColors = {
    normal: '#A8A77A',
    fire: '#EE8130',
    water: '#6390F0',
    electric: '#F7D02C',
    grass: '#7AC74C',
    ice: '#96D9D6',
    fighting: '#C22E28',
    poison: '#A33EA1',
    ground: '#E2BF65',
    flying: '#A98FF3',
    psychic: '#F95587',
    bug: '#A6B91A',
    rock: '#B6A136',
    ghost: '#735797',
    dragon: '#6F35FC',
    dark: '#705746',
    steel: '#B7B7CE',
    fairy: '#D685AD'
};

const pokemonType = document.querySelector('.pokemon__type');
const pokemonName = document.querySelector('.pokemon__name');
const pokemonNumber = document.querySelector('.pokemon__number');
const pokemonImage = document.querySelector('.pokemon__image');
const counters = document.querySelector('.counters');

const form = document.querySelector('.form');
const input = document.querySelector('.input__search');
const buttonPrev = document.querySelector('.btn-prev');
const buttonNext = document.querySelector('.btn-next');

let searchPokemon = 1;

const fetchPokemon = async (pokemon) => {
    const APIResponse = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemon}`);
    if (APIResponse.status == 200) {
        const data = await APIResponse.json();
        return data;
    }
}

const fetchTypeDamageRelations = async (typeName) => {
    const response = await fetch(`https://pokeapi.co/api/v2/type/${typeName}`);
    if (response.ok) {
        const data = await response.json();
        return data.damage_relations;
    }
    return null;
}

const renderPokemon = async (pokemon) => {
    pokemonName.innerHTML = 'Loading...';
    const data = await fetchPokemon(pokemon);

    if (data) {
        // --- Mostrar os tipos (invertido)
        const typesHtml = data.types.reverse().map(typeInfo => {
            const typeName = typeInfo.type.name;
            const typeIconUrl = `https://raw.githubusercontent.com/duiker101/pokemon-type-svg-icons/master/icons/${typeName}.svg`;
                const bgColor = typeColors[typeName] || '#777'; // Cor padrão se não achar
            
                return `
                    <span style="
                        display: flex; 
                        align-items: center; 
                        gap: 5px; 
                        margin-right: 5px;
                        background: ${bgColor};
                        padding: 5px 8px;
                        border-radius: 5px;
                        color: white;
                        font-weight: bold;
                    ">
                        <img src="${typeIconUrl}" alt="${typeName}" title="${typeName}" style="width: 20px; height: 20px;">
                    </span>
                `;
        }).join('');
        pokemonType.innerHTML = typesHtml;

        pokemonName.innerHTML = data.name;
        pokemonNumber.innerHTML = data.id;

        // --- Imagem do Pokémon
        const animatedSprite = data.sprites.versions['generation-v']['black-white']['animated']['front_default'];
        const staticSprite = data.sprites.front_default;
        if (animatedSprite) {
            pokemonImage.src = animatedSprite;
        } else if (staticSprite) {
            pokemonImage.src = staticSprite;
        } else {
            pokemonImage.style.display = 'none';
        }

        input.value = '';
        searchPokemon = data.id;
        pokemonImage.style.display = 'block';

        // --- Calcular e mostrar counters
        const types = data.types.map(typeInfo => typeInfo.type.name);
        const multipliers = {};

        for (const type of types) {
            const damageRelations = await fetchTypeDamageRelations(type);

            if (damageRelations) {
                damageRelations.no_damage_from.forEach(t => {
                    multipliers[t.name] = 0; // Imunidade total anula qualquer dano
                });
                
                // Só aplica fraquezas e resistências se ainda não for imune
                damageRelations.double_damage_from.forEach(t => {
                    if (multipliers[t.name] !== 0) {
                        multipliers[t.name] = (multipliers[t.name] || 1) * 2;
                    }
                });
                damageRelations.half_damage_from.forEach(t => {
                    if (multipliers[t.name] !== 0) {
                        multipliers[t.name] = (multipliers[t.name] || 1) * 0.5;
                    }
                });                
            }
        }

        const weaknesses = Object.entries(multipliers)
    .filter(([type, multiplier]) => multiplier > 1)
    .sort((a, b) => b[1] - a[1]); // Opcional: ordena da maior fraqueza para a menor

        // --- Atualizar a div dos counters
        if (weaknesses.length > 0) {
            const weaknessesHtml = weaknesses.map(([typeName, multiplier]) => {
                const typeIconUrl = `https://raw.githubusercontent.com/duiker101/pokemon-type-svg-icons/master/icons/${typeName}.svg`;
                const bgColor = typeColors[typeName] || '#777'; // Cor padrão se não achar
            
                return `
                    <div style="
                        display: flex; 
                        flex-direction: column;
                        align-items: center; 
                        justify-content: center;
                        gap: 2px;
                        margin-right: 1px;
                        background: ${bgColor};
                        padding: 5px 8px;
                        border-radius: 8px;
                        color: white;
                        font-weight: bold;
                        min-width: 0px;
                    ">
                        <img src="${typeIconUrl}" alt="${typeName}" title="${typeName}" style="width: 24px; height: 24px;">
                        <span style="font-size: 0.75rem;">${multiplier}x</span>
                    </div>
                `;
            }).join('');
            counters.innerHTML = weaknessesHtml;
        } else {
            counters.innerHTML = 'Sem fraquezas conhecidas.';
        }

    } else {
        pokemonImage.style.display = 'none';
        pokemonName.innerHTML = 'Escreve direito fdp';
        pokemonNumber.innerHTML = '';
    }
}

form.addEventListener('submit', (event) => {
    event.preventDefault();
    renderPokemon(input.value.toLowerCase());
});

buttonPrev.addEventListener('click', () => {
    if (searchPokemon > 1) {
        searchPokemon -= 1;
        renderPokemon(searchPokemon);
    }
});

buttonNext.addEventListener('click', () => {
    searchPokemon += 1;
    renderPokemon(searchPokemon);
});

renderPokemon(searchPokemon);
