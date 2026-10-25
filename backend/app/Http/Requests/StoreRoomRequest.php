<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreRoomRequest extends FormRequest
{
    /**
     * @return array<string, array<int, mixed>>
     */
    public function rules(): array
    {
        return [
            'name' => [
                'required',
                'string',
                'max:40',
                Rule::unique('rooms', 'name')->whereIn('status', ['open', 'playing']),
            ],
            'quick' => ['sometimes', 'boolean'],
            'settings' => ['required', 'array:width,height,pillars,softWalls,wrap,tickMs,players,startLength,food,bombs,wallHit,bodyHit,controls,camera,botMistakes'],
            'settings.width' => ['required', 'integer', 'between:10,75'],
            'settings.height' => ['required', 'integer', 'between:10,75'],
            'settings.pillars' => ['required', 'boolean'],
            // Con pilares no hay muros rompibles
            'settings.softWalls' => ['required', 'numeric', 'between:0,'.($this->boolean('settings.pillars') ? 0 : 0.5)],
            'settings.wrap' => ['required', 'boolean'],
            'settings.tickMs' => ['required', 'integer', 'between:50,1000'],
            'settings.players' => ['required', 'integer', 'between:1,4'],
            // El largo inicial crece con el tablero: hasta el 30 % del ancho
            'settings.startLength' => ['required', 'integer', 'between:1,'.intdiv((int) $this->input('settings.width') * 3, 10)],
            'settings.food' => ['required', 'integer', 'between:1,50'],
            'settings.bombs' => ['required', 'integer', 'between:0,10'],
            // Con pilares, chocar contra un muro no puede matar
            'settings.wallHit' => ['required', Rule::in($this->boolean('settings.pillars') ? ['block'] : ['block', 'die'])],
            'settings.bodyHit' => ['required', 'in:block,die'],
            'settings.controls' => ['required', 'in:turn,dpad'],
            'settings.camera' => ['required', 'in:board,follow,head'],
            // Porcentaje de ticks en que un bot no mira por dónde va
            'settings.botMistakes' => ['required', 'integer', 'between:20,80'],
        ];
    }
}
